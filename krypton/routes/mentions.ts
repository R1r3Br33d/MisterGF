/**
 * Mention Routes
 * Create mentions, track reputation
 */

import express, { Router, Request, Response } from 'express';
import { pool } from '../server';
import { verifyToken } from './auth';

const router = Router();

interface AuthRequest extends Request {
  userId?: string;
}

// Authenticity Scoring Algorithm
function scoreAuthenticity(mention: any, mentionerHistory: any): number {
  let score = 0;

  // Deep context (+30 points)
  if (mention.context && mention.context.length > 100) score += 30;

  // Recommender history (+20 points)
  const avgQuality = mentionerHistory.avgQualityScore || 50;
  score += (avgQuality / 100) * 20;

  // Engagement (+25 points)
  const engagement = mention.engagement || 0;
  score += Math.min((engagement / 100) * 25, 25);

  // Natural timing (+10 points)
  score += 10;

  // Language quality (+15 points)
  if (mention.context && mention.context.length > 50) score += 15;

  return Math.min(score, 100);
}

// Create Mention
router.post('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { mentioned_user_id, post_id, context } = req.body;
    const mentioner_id = req.userId;

    // Calculate authenticity
    const mentionerResult = await pool.query(
      `SELECT ur.trust_score FROM user_reputation ur WHERE ur.user_id = $1`,
      [mentioner_id]
    );

    const mentionerHistory = mentionerResult.rows[0] || { trust_score: 50 };

    const authenticity = scoreAuthenticity(
      { context, engagement: 0 },
      mentionerHistory
    );

    // Create mention
    const result = await pool.query(
      `INSERT INTO mentions (mentioner_id, mentioned_user_id, post_id, context, authenticity_score, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'verified', NOW())
       RETURNING id, authenticity_score, created_at`,
      [mentioner_id, mentioned_user_id, post_id, context, authenticity]
    );

    // Calculate reward
    const baseReward = 10; // satoshis
    const reward = Math.floor(baseReward * (authenticity / 100));

    // Update mentions count
    await pool.query(
      `UPDATE user_reputation
       SET mentions_received = mentions_received + 1, earned_value = earned_value + $1
       WHERE user_id = $2`,
      [reward, mentioned_user_id]
    );

    await pool.query(
      `UPDATE user_reputation
       SET mentions_given = mentions_given + 1
       WHERE user_id = $1`,
      [mentioner_id]
    );

    res.status(201).json({
      mention: result.rows[0],
      reward,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create mention' });
  }
});

// Get User Mentions
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = ((parseInt(page as string) || 1) - 1) * parseInt(limit as string);

    const result = await pool.query(
      `SELECT m.*, u.username, u.profile_image_url
       FROM mentions m
       JOIN users u ON m.mentioner_id = u.id
       WHERE m.mentioned_user_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch mentions' });
  }
});

// Get Reputation
router.get('/reputation/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT * FROM user_reputation WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reputation not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch reputation' });
  }
});

// Get Leaderboard
router.get('/leaderboard/top', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.profile_image_url, ur.mentions_received, ur.trust_score, u.followers_count
       FROM users u
       JOIN user_reputation ur ON u.id = ur.user_id
       ORDER BY ur.mentions_received DESC, ur.trust_score DESC
       LIMIT 50`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
