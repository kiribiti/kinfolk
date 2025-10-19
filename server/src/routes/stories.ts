import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getStories,
  createStory,
  updateStory,
  deleteStory,
  toggleLike,
} from '../controllers/storyController.js';

const router = express.Router();

// GET /api/stories
router.get('/', getStories);

// POST /api/stories
router.post('/', authenticateToken, createStory);

// PUT /api/stories/:id
router.put('/:id', authenticateToken, updateStory);

// DELETE /api/stories/:id
router.delete('/:id', authenticateToken, deleteStory);

// POST /api/stories/:id/like
router.post('/:id/like', authenticateToken, toggleLike);

export default router;
