import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  subscribe,
  unsubscribe,
  getSubscribers,
  removeSubscriber,
  approveSubscription,
  rejectSubscription,
  getUserSubscriptions,
} from '../controllers/subscriptionController.js';

const router = express.Router();

// POST /api/subscriptions/channels/:channelId/subscribe - Subscribe to a channel
router.post('/channels/:channelId/subscribe', authenticateToken, subscribe);

// POST /api/subscriptions/channels/:channelId/unsubscribe - Unsubscribe from a channel
router.post('/channels/:channelId/unsubscribe', authenticateToken, unsubscribe);

// GET /api/subscriptions/channels/:channelId/subscribers - Get channel subscribers
router.get('/channels/:channelId/subscribers', getSubscribers);

// DELETE /api/subscriptions/channels/:channelId/subscribers/:subscriberId - Remove a subscriber
router.delete('/channels/:channelId/subscribers/:subscriberId', authenticateToken, removeSubscriber);

// PUT /api/subscriptions/:id/approve - Approve a subscription
router.put('/:id/approve', authenticateToken, approveSubscription);

// PUT /api/subscriptions/:id/reject - Reject a subscription
router.put('/:id/reject', authenticateToken, rejectSubscription);

// GET /api/subscriptions/user - Get user's subscriptions
router.get('/user', authenticateToken, getUserSubscriptions);

export default router;
