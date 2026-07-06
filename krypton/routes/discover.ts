/**
 * Discovery Routes
 * Hub, trending, sectors
 */

import express, { Router, Request, Response } from 'express';
import { pool, redisClient } from '../server';

const router = Router();

// Get Trending Topics
router.get('/trending', async (req: Request, res: Response) => {
  try {
    // Try cache first
    const cached = await redisClient.get('trending_topics');
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const result = await pool.query(
      `SELECT name, sector, mention_count, post_count, popularity_score
       FROM trending_topics
       ORDER BY popularity_score DESC
       LIMIT 20`
    );

    // Cache for 5 minutes
    await redisClient.setEx('trending_topics', 300, JSON.stringify(result.rows));

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch trending' });
  }
});

// Get Sectors
router.get('/sectors', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT sector, COUNT(*) as post_count, COUNT(DISTINCT author_id) as active_users
       FROM blog_posts
       WHERE published = TRUE
       GROUP BY sector
       ORDER BY post_count DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch sectors' });
  }
});

// Get Posts in Sector
router.get('/sectors/:sector', async (req: Request, res: Response) => {
  try {
    const { sector } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = ((parseInt(page as string) || 1) - 1) * parseInt(limit as string);

    const result = await pool.query(
      `SELECT bp.id, bp.title, bp.views, bp.mention_count, bp.created_at,
              u.username, u.profile_image_url
       FROM blog_posts bp
       JOIN users u ON bp.author_id = u.id
       WHERE bp.sector = $1 AND bp.published = TRUE
       ORDER BY bp.views DESC
       LIMIT $2 OFFSET $3`,
      [sector, limit, offset]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch sector posts' });
  }
});

// Get Community Spotlight
router.get('/spotlight', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.profile_image_url, u.followers_count, ur.mentions_received
       FROM users u
       JOIN user_reputation ur ON u.id = ur.user_id
       ORDER BY ur.mentions_received DESC, u.followers_count DESC
       LIMIT 10`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch spotlight' });
  }
});

// Get Hub Dashboard
router.get('/hub', async (req: Request, res: Response) => {
  try {
    const [trending, sectors, spotlight] = await Promise.all([
      pool.query('SELECT * FROM trending_topics ORDER BY popularity_score DESC LIMIT 10'),
      pool.query(`SELECT sector, COUNT(*) as count FROM blog_posts WHERE published = TRUE GROUP BY sector`),
      pool.query(
        `SELECT u.username, u.followers_count FROM users u
         JOIN user_reputation ur ON u.id = ur.user_id
         ORDER BY ur.mentions_received DESC LIMIT 5`
      ),
    ]);

    res.json({
      trending: trending.rows,
      sectors: sectors.rows,
      spotlight: spotlight.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch hub' });
  }
});

export default router;
