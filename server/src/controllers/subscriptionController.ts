import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';

export const subscribe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const channelId = parseInt(req.params.channelId);

    // Check if channel exists
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel) {
      return res.status(404).json({ success: false, error: 'Channel not found' });
    }

    // Check if user owns the channel
    if (channel.userId === req.user.id) {
      return res.status(400).json({ success: false, error: 'Cannot subscribe to your own channel' });
    }

    // Check if already subscribed
    const existingSubscription = await prisma.subscription.findUnique({
      where: {
        subscriberId_channelId: {
          subscriberId: req.user.id,
          channelId,
        },
      },
    });

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        error: existingSubscription.status === 'approved'
          ? 'Already subscribed to this channel'
          : 'Subscription request already pending'
      });
    }

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        subscriberId: req.user.id,
        channelId,
        status: channel.isPrivate ? 'pending' : 'approved',
      },
      include: {
        channel: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // Update subscriber count if auto-approved
    if (subscription.status === 'approved') {
      await prisma.channel.update({
        where: { id: channelId },
        data: { subscriberCount: { increment: 1 } },
      });
    }

    res.status(201).json({
      success: true,
      data: subscription,
      message: channel.isPrivate
        ? 'Subscription request sent. Awaiting approval.'
        : 'Successfully subscribed to channel',
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    if (error instanceof Error) {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to subscribe to channel' });
    }
  }
};

export const unsubscribe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const channelId = parseInt(req.params.channelId);

    const subscription = await prisma.subscription.findUnique({
      where: {
        subscriberId_channelId: {
          subscriberId: req.user.id,
          channelId,
        },
      },
    });

    if (!subscription) {
      return res.status(404).json({ success: false, error: 'Subscription not found' });
    }

    // Delete subscription
    await prisma.subscription.delete({
      where: {
        subscriberId_channelId: {
          subscriberId: req.user.id,
          channelId,
        },
      },
    });

    // Update subscriber count if was approved
    if (subscription.status === 'approved') {
      await prisma.channel.update({
        where: { id: channelId },
        data: { subscriberCount: { decrement: 1 } },
      });
    }

    res.json({
      success: true,
      message: 'Successfully unsubscribed from channel',
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ success: false, error: 'Failed to unsubscribe from channel' });
  }
};

export const getSubscribers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const channelId = parseInt(req.params.channelId);

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel) {
      return res.status(404).json({ success: false, error: 'Channel not found' });
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { channelId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            verified: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch subscribers' });
  }
};

export const removeSubscriber = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const channelId = parseInt(req.params.channelId);
    const subscriberId = parseInt(req.params.subscriberId);

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel) {
      return res.status(404).json({ success: false, error: 'Channel not found' });
    }

    // Only channel owner can remove subscribers
    if (channel.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only channel owner can remove subscribers' });
    }

    const subscription = await prisma.subscription.findUnique({
      where: {
        userId_channelId: {
          userId: subscriberId,
          channelId,
        },
      },
    });

    if (!subscription) {
      return res.status(404).json({ success: false, error: 'Subscriber not found' });
    }

    await prisma.subscription.delete({
      where: {
        userId_channelId: {
          userId: subscriberId,
          channelId,
        },
      },
    });

    // Update subscriber count if was approved
    if (subscription.status === 'approved') {
      await prisma.channel.update({
        where: { id: channelId },
        data: { subscriberCount: { decrement: 1 } },
      });
    }

    res.json({
      success: true,
      message: 'Subscriber removed successfully',
    });
  } catch (error) {
    console.error('Remove subscriber error:', error);
    res.status(500).json({ success: false, error: 'Failed to remove subscriber' });
  }
};

export const approveSubscription = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const subscriptionId = parseInt(req.params.id);

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { channel: true },
    });

    if (!subscription) {
      return res.status(404).json({ success: false, error: 'Subscription not found' });
    }

    // Only channel owner can approve subscriptions
    if (subscription.channel.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only channel owner can approve subscriptions' });
    }

    if (subscription.status === 'approved') {
      return res.status(400).json({ success: false, error: 'Subscription already approved' });
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'approved' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            verified: true,
          },
        },
      },
    });

    // Update subscriber count
    await prisma.channel.update({
      where: { id: subscription.channelId },
      data: { subscriberCount: { increment: 1 } },
    });

    res.json({
      success: true,
      data: updatedSubscription,
      message: 'Subscription approved successfully',
    });
  } catch (error) {
    console.error('Approve subscription error:', error);
    res.status(500).json({ success: false, error: 'Failed to approve subscription' });
  }
};

export const rejectSubscription = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const subscriptionId = parseInt(req.params.id);

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { channel: true },
    });

    if (!subscription) {
      return res.status(404).json({ success: false, error: 'Subscription not found' });
    }

    // Only channel owner can reject subscriptions
    if (subscription.channel.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only channel owner can reject subscriptions' });
    }

    if (subscription.status === 'approved') {
      return res.status(400).json({ success: false, error: 'Cannot reject an approved subscription' });
    }

    await prisma.subscription.delete({
      where: { id: subscriptionId },
    });

    res.json({
      success: true,
      message: 'Subscription rejected successfully',
    });
  } catch (error) {
    console.error('Reject subscription error:', error);
    res.status(500).json({ success: false, error: 'Failed to reject subscription' });
  }
};

export const getUserSubscriptions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const subscriptions = await prisma.subscription.findMany({
      where: {
        subscriberId: req.user.id,
        status: 'approved',
      },
      include: {
        channel: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar: true,
                verified: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    console.error('Get user subscriptions error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch subscriptions' });
  }
};
