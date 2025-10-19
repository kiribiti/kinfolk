import express, { Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';
import { updateUserSchema } from '../types/validation.js';

const router = express.Router();

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        verified: true,
        bio: true,
        location: true,
        website: true,
        joinedDate: true,
        themeId: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Get subscriber/subscription counts
    const subscriberCount = await prisma.subscription.count({
      where: {
        channel: { userId: user.id },
        status: 'active',
      },
    });

    const subscriptionCount = await prisma.subscription.count({
      where: {
        subscriberId: user.id,
        status: 'active',
      },
    });

    res.json({
      success: true,
      data: {
        ...user,
        subscribers: subscriberCount,
        subscriptions: subscriptionCount,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
});

// PUT /api/users/:id
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const userId = parseInt(req.params.id);

    if (userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You can only update your own profile' });
    }

    const data = updateUserSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        verified: true,
        bio: true,
        location: true,
        website: true,
        joinedDate: true,
        themeId: true,
      },
    });

    res.json({
      success: true,
      data: user,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

export default router;
