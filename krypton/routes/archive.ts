/**
 * Archive Routes
 * Search and filter historical content
 */

import express, { Router, Request, Response } from 'express';
import { pool } from '../server';

const router = Router();

// Search Archive
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, sector, topic, timeRange, sortBy, page = 1, limit = 20 } = req.query;
    const offset = ((parseInt(page as string) || 1) - 1) * parseInt(limit as string);

    let query = 'SELECT * FROM blog_posts WHERE published = TRUE';
    const params: any[] = [];
    let paramCount = 1;

    // Full-text search
    if (q) {
      query += ` AND (title ILIKE $${paramCount} OR content ILIKE $${paramCount})`;
      params.push(`%${q}%`);
      paramCount++;
    }

    // Sector filter
    if (sector) {
      query += ` AND sector = $${paramCount}`;
      params.push(sector);
      paramCount++;
    }

    // Topic filter
    if (topic) {
      query += ` AND $${paramCount} = ANY(tags)`;
      params.push(topic);
      paramCount++;
    }

    // Time range filter
    if (timeRange) {
      let dateFilter = '';
      switch (timeRange) {
        case 'today':
          dateFilter = 'published_at > NOW() - INTERVAL \'1 day\'';
          break;
        case 'week':
          dateFilter = 'published_at > NOW() - INTERVAL \'7 days\'';
          break;
        case 'month':
          dateFilter = 'published_at > NOW() - INTERVAL \'30 days\'';
          break;
        case 'year':
          dateFilter = 'published_at > NOW() - INTERVAL \'1 year\'';
          break;
      }
      if (dateFilter) query += ` AND ${dateFilter}`;
    }

    // Sorting
    switch (sortBy) {
      case 'popular':
        query += ' ORDER BY views DESC';
        break;
      case 'newest':
        query += ' ORDER BY published_at DESC';
        break;
      case 'mentions':
        query += ' ORDER BY mention_count DESC';
        break;
      default:
        query += ' ORDER BY views DESC';
    }

    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      results: result.rows,
      count: result.rows.length,
      page,
      limit,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get Posts by Sector
router.get('/sector/:sector', async (req: Request, res: Response) => {
  try {
    const { sector } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = ((parseInt(page as string) || 1) - 1) * parseInt(limit as string);

    const result = await pool.query(
      `SELECT * FROM blog_posts
       WHERE sector = $1 AND published = TRUE
       ORDER BY views DESC
       LIMIT $2 OFFSET $3`,
      [sector, limit, offset]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch sector posts' });
  }
});

// Get Posts by Topic
router.get('/topic/:topic', async (req: Request, res: Response) => {
  try {
    const { topic } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = ((parseInt(page as string) || 1) - 1) * parseInt(limit as string);

    const result = await pool.query(
      `SELECT * FROM blog_posts
       WHERE $1 = ANY(tags) AND published = TRUE
       ORDER BY views DESC
       LIMIT $2 OFFSET $3`,
      [topic, limit, offset]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch topic posts' });
  }
});

export default router;
