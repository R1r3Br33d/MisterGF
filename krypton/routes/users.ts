/**
 * User Routes
 * Profile management, followers, etc.
 */

import express, { Router, Request, Response } from 'express';
import { pool, redisClient } from '../server';
import { verifyToken } from './auth';

const router = Router();

interface AuthRequest extends Request {
  userId?: string;
}

// Get User Profile
router.get('/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    const result = await pool.query(
      `SELECT id, username, email, bio, profile_image_url, followers_count, 
              following_count, sectors, created_at FROM users WHERE username = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update Profile
router.put('/:userId', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { bio, profile_image_url, custom_css, sectors } = req.body;

    // Verify ownership
    if (req.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(
      `UPDATE users SET bio = $1, profile_image_url = $2, custom_css = $3, sectors = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING id, username, bio, profile_image_url, sectors`,
      [bio, profile_image_url, custom_css, sectors, userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Follow User
router.post('/:userId/follow', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const followerId = req.userId;

    if (followerId === userId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Create follow relationship
    await pool.query(
      `INSERT INTO follows (follower_id, following_id, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT DO NOTHING`,
      [followerId, userId]
    );

    // Increment followers count
    await pool.query('UPDATE users SET followers_count = followers_count + 1 WHERE id = $1', [userId]);

    res.json({ message: 'Following user' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// Unfollow User
router.post('/:userId/unfollow', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const followerId = req.userId;

    // Remove follow relationship
    await pool.query('DELETE FROM follows WHERE follower_id = $1 AND following_id = $2', [
      followerId,
      userId,
    ]);

    // Decrement followers count
    await pool.query('UPDATE users SET followers_count = followers_count - 1 WHERE id = $1', [userId]);

    res.json({ message: 'Unfollowed user' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

// Get Followers
router.get('/:userId/followers', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = ((parseInt(page as string) || 1) - 1) * parseInt(limit as string);

    const result = await pool.query(
      `SELECT u.id, u.username, u.profile_image_url FROM users u
       JOIN follows f ON u.id = f.follower_id
       WHERE f.following_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
});

export default router;
