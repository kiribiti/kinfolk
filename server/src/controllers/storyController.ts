import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';
import { formatTimestamp } from '../utils/formatters.js';
import { createStorySchema, updateStorySchema } from '../types/validation.js';

export const getStories = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const stories = await prisma.story.findMany({
      take: limit,
      skip,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        channel: true,
        likedBy: {
          select: { userId: true },
        },
        media: true,
        _count: {
          select: { replies: true },
        },
      },
    });

    const formattedStories = stories.map(story => ({
      id: story.id,
      userId: story.userId,
      channelId: story.channelId,
      parentId: story.parentId,
      content: story.content,
      timestamp: formatTimestamp(story.createdAt),
      createdAt: story.createdAt,
      likes: story.likes,
      comments: story._count.replies,
      likedBy: story.likedBy.map(l => l.userId),
      media: story.media,
    }));

    res.json({
      success: true,
      data: formattedStories,
    });
  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stories' });
  }
};

export const createStory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const data = createStorySchema.parse(req.body);

    // Verify channel exists
    const channel = await prisma.channel.findUnique({
      where: { id: data.channelId },
    });

    if (!channel) {
      return res.status(404).json({ success: false, error: 'Channel not found' });
    }

    // Verify user owns the channel
    if (channel.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You can only post to your own channels' });
    }

    // If parentId is provided, verify parent story exists
    if (data.parentId) {
      const parentStory = await prisma.story.findUnique({
        where: { id: data.parentId },
      });
      if (!parentStory) {
        return res.status(404).json({ success: false, error: 'Parent story not found' });
      }
    }

    // Create story
    const story = await prisma.story.create({
      data: {
        userId: req.user.id,
        channelId: data.channelId,
        parentId: data.parentId,
        content: data.content,
        media: data.media ? {
          create: data.media.map(m => ({
            id: m.id,
            type: m.type,
            url: m.url,
            thumbnail: m.thumbnail,
          })),
        } : undefined,
      },
      include: {
        likedBy: { select: { userId: true } },
        media: true,
        _count: { select: { replies: true } },
      },
    });

    // Update channel story count
    await prisma.channel.update({
      where: { id: data.channelId },
      data: { storyCount: { increment: 1 } },
    });

    res.status(201).json({
      success: true,
      data: {
        id: story.id,
        userId: story.userId,
        channelId: story.channelId,
        parentId: story.parentId,
        content: story.content,
        timestamp: formatTimestamp(story.createdAt),
        createdAt: story.createdAt,
        likes: story.likes,
        comments: story._count.replies,
        likedBy: story.likedBy.map(l => l.userId),
        media: story.media,
      },
      message: data.parentId ? 'Comment created successfully' : 'Story created successfully',
    });
  } catch (error) {
    console.error('Create story error:', error);
    if (error instanceof Error) {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Failed to create story' });
    }
  }
};

export const updateStory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const storyId = parseInt(req.params.id);
    const data = updateStorySchema.parse(req.body);

    const story = await prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      return res.status(404).json({ success: false, error: 'Story not found' });
    }

    if (story.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You can only update your own stories' });
    }

    const updatedStory = await prisma.story.update({
      where: { id: storyId },
      data: { content: data.content },
      include: {
        likedBy: { select: { userId: true } },
        media: true,
        _count: { select: { replies: true } },
      },
    });

    res.json({
      success: true,
      data: {
        id: updatedStory.id,
        userId: updatedStory.userId,
        channelId: updatedStory.channelId,
        parentId: updatedStory.parentId,
        content: updatedStory.content,
        timestamp: formatTimestamp(updatedStory.createdAt),
        createdAt: updatedStory.createdAt,
        likes: updatedStory.likes,
        comments: updatedStory._count.replies,
        likedBy: updatedStory.likedBy.map(l => l.userId),
        media: updatedStory.media,
      },
      message: 'Story updated successfully',
    });
  } catch (error) {
    console.error('Update story error:', error);
    res.status(500).json({ success: false, error: 'Failed to update story' });
  }
};

export const deleteStory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const storyId = parseInt(req.params.id);

    const story = await prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      return res.status(404).json({ success: false, error: 'Story not found' });
    }

    if (story.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You can only delete your own stories' });
    }

    await prisma.story.delete({
      where: { id: storyId },
    });

    // Update channel story count
    await prisma.channel.update({
      where: { id: story.channelId },
      data: { storyCount: { decrement: 1 } },
    });

    res.json({
      success: true,
      message: 'Story deleted successfully',
    });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete story' });
  }
};

export const toggleLike = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const storyId = parseInt(req.params.id);

    const story = await prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      return res.status(404).json({ success: false, error: 'Story not found' });
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_storyId: {
          userId: req.user.id,
          storyId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          userId_storyId: {
            userId: req.user.id,
            storyId,
          },
        },
      });
      await prisma.story.update({
        where: { id: storyId },
        data: { likes: { decrement: 1 } },
      });
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId: req.user.id,
          storyId,
        },
      });
      await prisma.story.update({
        where: { id: storyId },
        data: { likes: { increment: 1 } },
      });
    }

    // Fetch updated story
    const updatedStory = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        likedBy: { select: { userId: true } },
        media: true,
        _count: { select: { replies: true } },
      },
    });

    res.json({
      success: true,
      data: {
        id: updatedStory!.id,
        userId: updatedStory!.userId,
        channelId: updatedStory!.channelId,
        parentId: updatedStory!.parentId,
        content: updatedStory!.content,
        timestamp: formatTimestamp(updatedStory!.createdAt),
        createdAt: updatedStory!.createdAt,
        likes: updatedStory!.likes,
        comments: updatedStory!._count.replies,
        likedBy: updatedStory!.likedBy.map(l => l.userId),
        media: updatedStory!.media,
      },
      liked: !existingLike,
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ success: false, error: 'Failed to toggle like' });
  }
};
