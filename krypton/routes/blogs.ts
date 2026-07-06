/**
 * Blog Routes
 * Create, read, update, delete posts
 */

import express, { Router, Request, Response } from 'express';
import { pool } from '../server';
import { verifyToken } from './auth';

const router = Router();

interface AuthRequest extends Request {
  userId?: string;
}

// Get User's Blog
router.get('/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    // Get user
    const userResult = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userResult.rows[0].id;

    // Get user's posts
    const postsResult = await pool.query(
      `SELECT id, title, content, sector, tags, views, comments_count, mention_count,
              authenticity_score, recommendation_score, created_at, published_at
       FROM blog_posts
       WHERE author_id = $1 AND published = TRUE
       ORDER BY published_at DESC
       LIMIT 50`,
      [userId]
    );

    res.json({
      username,
      posts: postsResult.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
});

// Create Blog Post
router.post('/:userId/posts', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { title, content, sector, tags } = req.body;

    // Verify ownership
    if (req.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(
      `INSERT INTO blog_posts (author_id, title, content, sector, tags, published, created_at, published_at)
       VALUES ($1, $2, $3, $4, $5, TRUE, NOW(), NOW())
       RETURNING id, title, content, sector, tags, created_at`,
      [userId, title, content, sector, tags || []]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get Single Post
router.get('/posts/:postId', async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const result = await pool.query(
      `SELECT bp.*, u.username, u.profile_image_url
       FROM blog_posts bp
       JOIN users u ON bp.author_id = u.id
       WHERE bp.id = $1`,
      [postId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Increment views
    await pool.query('UPDATE blog_posts SET views = views + 1 WHERE id = $1', [postId]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Update Post
router.put('/posts/:postId', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const { title, content, sector, tags } = req.body;

    // Verify ownership
    const postResult = await pool.query('SELECT author_id FROM blog_posts WHERE id = $1', [postId]);
    if (postResult.rows.length === 0 || postResult.rows[0].author_id !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(
      `UPDATE blog_posts SET title = $1, content = $2, sector = $3, tags = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING id, title, content, sector, tags`,
      [title, content, sector, tags, postId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete Post
router.delete('/posts/:postId', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;

    // Verify ownership
    const postResult = await pool.query('SELECT author_id FROM blog_posts WHERE id = $1', [postId]);
    if (postResult.rows.length === 0 || postResult.rows[0].author_id !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await pool.query('DELETE FROM blog_posts WHERE id = $1', [postId]);

    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Add Comment
router.post('/posts/:postId/comments', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    const result = await pool.query(
      `INSERT INTO comments (post_id, author_id, content, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, content, created_at`,
      [postId, req.userId, content]
    );

    // Increment comments count
    await pool.query('UPDATE blog_posts SET comments_count = comments_count + 1 WHERE id = $1', [
      postId,
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

export default router;
