/**
 * Patronage Routes
 * Subscriptions, donations, monetization
 */

import express, { Router, Request, Response } from 'express';
import { pool } from '../server';
import { verifyToken } from './auth';

const router = Router();

interface AuthRequest extends Request {
  userId?: string;
}

// Get Patronage Options
router.get('/options', async (req: Request, res: Response) => {
  try {
    res.json([
      {
        id: 'free',
        name: 'Free',
        price: 0,
        features: ['Unlimited blog creation', 'Basic profile', 'Community features'],
      },
      {
        id: 'creator',
        name: 'Creator',
        price: 4.99,
        features: ['All Free features', 'Advanced analytics', 'Extra storage (5GB)', 'No ads'],
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 9.99,
        features: ['All Creator features', 'Priority support', 'Custom domain', '20GB storage'],
      },
    ]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch options' });
  }
});

// Subscribe to Patronage
router.post('/subscribe', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { tier } = req.body;
    const userId = req.userId;

    // Create subscription (simplified)
    const result = await pool.query(
      `INSERT INTO patronage_subscriptions (user_id, tier, status, created_at, renewed_at)
       VALUES ($1, $2, 'active', NOW(), NOW())
       RETURNING id, tier, status, created_at`,
      [userId, tier]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// Get Patronage Status
router.get('/status/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT * FROM patronage_subscriptions WHERE user_id = $1 AND status = 'active'`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({ tier: 'free', status: 'inactive' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

// Make Donation
router.post('/donate', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, message } = req.body;
    const donorId = req.userId;

    // Create donation record
    const result = await pool.query(
      `INSERT INTO donations (donor_id, amount, message, public, created_at)
       VALUES ($1, $2, $3, TRUE, NOW())
       RETURNING id, amount, created_at`,
      [donorId, amount, message || '']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process donation' });
  }
});

// Get Community Treasury
router.get('/treasury', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT transaction_type, SUM(amount) as total FROM community_treasury
       WHERE public = TRUE
       GROUP BY transaction_type`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch treasury' });
  }
});

export default router;
