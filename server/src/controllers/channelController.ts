import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';
import { createChannelSchema, updateChannelSchema } from '../types/validation.js';

export const getChannels = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;

    const channels = await prisma.channel.findMany({
      where: userId ? { userId } : undefined,
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
        _count: {
          select: {
            stories: true,
            subscriptions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedChannels = channels.map(channel => ({
      id: channel.id,
      platformId: channel.platformId,
      userId: channel.userId,
      name: channel.name,
      description: channel.description,
      isPrimary: channel.isPrimary,
      isPrivate: channel.isPrivate,
      subscriberCount: channel._count.subscriptions,
      storyCount: channel._count.stories,
      user: channel.user,
      createdAt: channel.createdAt,
    }));

    res.json({
      success: true,
      data: formattedChannels,
    });
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch channels' });
  }
};

export const getChannel = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const channelId = parseInt(req.params.id);

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
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
        _count: {
          select: {
            stories: true,
            subscriptions: true,
          },
        },
      },
    });

    if (!channel) {
      return res.status(404).json({ success: false, error: 'Channel not found' });
    }

    res.json({
      success: true,
      data: {
        id: channel.id,
        platformId: channel.platformId,
        userId: channel.userId,
        name: channel.name,
        description: channel.description,
        isPrimary: channel.isPrimary,
        isPrivate: channel.isPrivate,
        subscriberCount: channel._count.subscriptions,
        storyCount: channel._count.stories,
        user: channel.user,
        createdAt: channel.createdAt,
      },
    });
  } catch (error) {
    console.error('Get channel error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch channel' });
  }
};

export const createChannel = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const data = createChannelSchema.parse(req.body);

    // Check how many channels the user has
    const userChannelCount = await prisma.channel.count({
      where: { userId: req.user.id },
    });

    const channel = await prisma.channel.create({
      data: {
        userId: req.user.id,
        name: data.name,
        description: data.description,
        isPrivate: data.isPrivate,
        isPrimary: userChannelCount === 0, // First channel is primary
      },
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

    res.status(201).json({
      success: true,
      data: {
        id: channel.id,
        platformId: channel.platformId,
        userId: channel.userId,
        name: channel.name,
        description: channel.description,
        isPrimary: channel.isPrimary,
        isPrivate: channel.isPrivate,
        subscriberCount: 0,
        storyCount: 0,
        user: channel.user,
        createdAt: channel.createdAt,
      },
      message: 'Channel created successfully',
    });
  } catch (error) {
    console.error('Create channel error:', error);
    if (error instanceof Error) {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to create channel' });
    }
  }
};

export const updateChannel = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const channelId = parseInt(req.params.id);
    const data = updateChannelSchema.parse(req.body);

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel) {
      return res.status(404).json({ success: false, error: 'Channel not found' });
    }

    if (channel.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You can only update your own channels' });
    }

    const updatedChannel = await prisma.channel.update({
      where: { id: channelId },
      data: {
        name: data.name,
        description: data.description,
        isPrivate: data.isPrivate,
      },
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
        _count: {
          select: {
            stories: true,
            subscriptions: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        id: updatedChannel.id,
        platformId: updatedChannel.platformId,
        userId: updatedChannel.userId,
        name: updatedChannel.name,
        description: updatedChannel.description,
        isPrimary: updatedChannel.isPrimary,
        isPrivate: updatedChannel.isPrivate,
        subscriberCount: updatedChannel._count.subscribers,
        storyCount: updatedChannel._count.stories,
        user: updatedChannel.user,
        createdAt: updatedChannel.createdAt,
      },
      message: 'Channel updated successfully',
    });
  } catch (error) {
    console.error('Update channel error:', error);
    res.status(500).json({ success: false, error: 'Failed to update channel' });
  }
};

export const deleteChannel = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const channelId = parseInt(req.params.id);

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel) {
      return res.status(404).json({ success: false, error: 'Channel not found' });
    }

    if (channel.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You can only delete your own channels' });
    }

    if (channel.isPrimary) {
      return res.status(403).json({ success: false, error: 'Cannot delete primary channel' });
    }

    // Delete the channel (cascade will handle stories, subscriptions, etc.)
    await prisma.channel.delete({
      where: { id: channelId },
    });

    res.json({
      success: true,
      message: 'Channel deleted successfully',
    });
  } catch (error) {
    console.error('Delete channel error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete channel' });
  }
};

export const getChannelStories = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const channelId = parseInt(req.params.id);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel) {
      return res.status(404).json({ success: false, error: 'Channel not found' });
    }

    const stories = await prisma.story.findMany({
      where: { channelId },
      take: limit,
      skip,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        likedBy: {
          select: { userId: true },
        },
        media: true,
        _count: {
          select: { replies: true },
        },
      },
    });

    res.json({
      success: true,
      data: stories,
    });
  } catch (error) {
    console.error('Get channel stories error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch channel stories' });
  }
};
