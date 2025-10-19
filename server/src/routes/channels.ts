import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getChannels,
  getChannel,
  createChannel,
  updateChannel,
  deleteChannel,
  getChannelStories,
} from '../controllers/channelController.js';

const router = express.Router();

// GET /api/channels - Get all channels (optional ?userId=X filter)
router.get('/', getChannels);

// GET /api/channels/:id - Get specific channel
router.get('/:id', getChannel);

// POST /api/channels - Create new channel
router.post('/', authenticateToken, createChannel);

// PUT /api/channels/:id - Update channel
router.put('/:id', authenticateToken, updateChannel);

// DELETE /api/channels/:id - Delete channel
router.delete('/:id', authenticateToken, deleteChannel);

// GET /api/channels/:id/stories - Get stories for a channel
router.get('/:id/stories', getChannelStories);

export default router;
