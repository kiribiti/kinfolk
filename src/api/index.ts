import { Post, User, MediaFile, Subscription } from '../types';
import { postsDB, channelsDB, subscriptionsDB, mockUsers, formatTimestamp } from '../data/mockData';

const simulateDelay = (min = 300, max = 800): Promise<void> => {
  return new Promise(resolve =>
    setTimeout(resolve, Math.random() * (max - min) + min)
  );
};

export const ApiService = {
  async getPosts() {
    await simulateDelay();
    return {
      success: true,
      data: postsDB.map(post => ({
        ...post,
        timestamp: formatTimestamp(post.createdAt || new Date()),
      })),
    };
  },

  async createPost(userId: number, content: string, media?: MediaFile[], channelId?: number, parentId?: number) {
    await simulateDelay(400, 1000);

    if (!content || content.trim().length === 0) {
      return { success: false, error: 'Post content cannot be empty' };
    }
    if (content.length > 500) {
      return { success: false, error: 'Post content must be 500 characters or less' };
    }
    if (!channelId) {
      return { success: false, error: 'Channel ID is required' };
    }

    // If parentId is provided, verify the parent post exists
    if (parentId) {
      const parentPost = postsDB.find(p => p.id === parentId);
      if (!parentPost) {
        return { success: false, error: 'Parent post not found' };
      }
    }

    const newPost: Post = {
      id: Date.now(),
      userId,
      channelId,
      parentId,
      content: content.trim(),
      timestamp: 'Just now',
      createdAt: new Date(),
      likes: 0,
      comments: 0,
      likedBy: [],
      media: media || [],
    };

    postsDB.unshift(newPost);
    return { success: true, data: newPost, message: parentId ? 'Comment created successfully' : 'Post created successfully' };
  },

  async updatePost(postId: number, content: string) {
    await simulateDelay(400, 800);

    const postIndex = postsDB.findIndex(p => p.id === postId);
    if (postIndex === -1) {
      return { success: false, error: 'Post not found' };
    }

    if (content.length > 500) {
      return { success: false, error: 'Post content must be 500 characters or less' };
    }

    postsDB[postIndex] = {
      ...postsDB[postIndex],
      content: content.trim(),
    };

    return {
      success: true,
      data: {
        ...postsDB[postIndex],
        timestamp: formatTimestamp(postsDB[postIndex].createdAt || new Date()),
      },
      message: 'Post updated successfully',
    };
  },

  async deletePost(postId: number, userId: number) {
    await simulateDelay(300, 600);

    const postIndex = postsDB.findIndex(p => p.id === postId);
    if (postIndex === -1) {
      return { success: false, error: 'Post not found' };
    }

    if (postsDB[postIndex].userId !== userId) {
      return { success: false, error: 'Unauthorized: You can only delete your own posts' };
    }

    postsDB.splice(postIndex, 1);
    return { success: true, message: 'Post deleted successfully' };
  },

  async toggleLike(postId: number, userId: number) {
    await simulateDelay(200, 400);

    const postIndex = postsDB.findIndex(p => p.id === postId);
    if (postIndex === -1) {
      return { success: false, error: 'Post not found' };
    }

    const post = postsDB[postIndex];
    const isLiked = post.likedBy.includes(userId);

    postsDB[postIndex] = {
      ...post,
      likes: isLiked ? post.likes - 1 : post.likes + 1,
      likedBy: isLiked
        ? post.likedBy.filter(id => id !== userId)
        : [...post.likedBy, userId],
    };

    return {
      success: true,
      data: {
        ...postsDB[postIndex],
        timestamp: formatTimestamp(postsDB[postIndex].createdAt || new Date()),
      },
      liked: !isLiked,
    };
  },

  async subscribeToChannel(userId: number, channelId: number) {
    await simulateDelay(300, 600);

    const channel = channelsDB.find(c => c.id === channelId);
    if (!channel) {
      return { success: false, error: 'Channel not found' };
    }

    if (channel.userId === userId) {
      return { success: false, error: 'Cannot subscribe to your own channel' };
    }

    const existingSubscription = subscriptionsDB.find(
      s => s.subscriberId === userId && s.channelId === channelId && s.status !== 'denied'
    );

    if (existingSubscription) {
      return { success: false, error: 'Already subscribed or pending' };
    }

    const newSubscription: Subscription = {
      id: Date.now(),
      subscriberId: userId,
      channelId,
      status: channel.isPrivate ? 'pending' : 'active',
      createdAt: new Date(),
      approvedAt: channel.isPrivate ? undefined : new Date(),
    };

    subscriptionsDB.push(newSubscription);

    if (!channel.isPrivate) {
      channel.subscriberCount++;
    }

    return {
      success: true,
      data: newSubscription,
      message: channel.isPrivate ? 'Subscription request sent' : 'Subscribed successfully',
    };
  },

  async unsubscribeFromChannel(userId: number, channelId: number) {
    await simulateDelay(300, 600);

    const subscriptionIndex = subscriptionsDB.findIndex(
      s => s.subscriberId === userId && s.channelId === channelId
    );

    if (subscriptionIndex === -1) {
      return { success: false, error: 'Subscription not found' };
    }

    const subscription = subscriptionsDB[subscriptionIndex];
    subscriptionsDB.splice(subscriptionIndex, 1);

    if (subscription.status === 'active') {
      const channel = channelsDB.find(c => c.id === channelId);
      if (channel) {
        channel.subscriberCount = Math.max(0, channel.subscriberCount - 1);
      }
    }

    return { success: true, message: 'Unsubscribed successfully' };
  },

  async getChannelSubscribers(channelId: number) {
    await simulateDelay(200, 400);

    const channel = channelsDB.find(c => c.id === channelId);
    if (!channel) {
      return { success: false, error: 'Channel not found' };
    }

    const subscribers = subscriptionsDB
      .filter(s => s.channelId === channelId && s.status === 'active')
      .map(s => {
        const user = mockUsers.find(u => u.id === s.subscriberId);
        return user ? { ...user, subscribedAt: s.approvedAt } : null;
      })
      .filter(u => u !== null);

    return { success: true, data: subscribers };
  },

  async removeSubscriber(channelId: number, subscriberId: number, channelOwnerId: number) {
    await simulateDelay(300, 600);

    const channel = channelsDB.find(c => c.id === channelId);
    if (!channel) {
      return { success: false, error: 'Channel not found' };
    }

    if (channel.userId !== channelOwnerId) {
      return { success: false, error: 'Unauthorized: Only channel owner can remove subscribers' };
    }

    const subscriptionIndex = subscriptionsDB.findIndex(
      s => s.subscriberId === subscriberId && s.channelId === channelId && s.status === 'active'
    );

    if (subscriptionIndex === -1) {
      return { success: false, error: 'Subscriber not found' };
    }

    subscriptionsDB.splice(subscriptionIndex, 1);
    channel.subscriberCount = Math.max(0, channel.subscriberCount - 1);

    return { success: true, message: 'Subscriber removed successfully' };
  },

  async updateUserProfile(userId: number, updates: Partial<Pick<User, 'name' | 'bio' | 'location' | 'website'>>) {
    await simulateDelay(300, 600);

    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return { success: false, error: 'User not found' };
    }

    // Validate name if provided
    if (updates.name !== undefined) {
      if (!updates.name || updates.name.trim().length === 0) {
        return { success: false, error: 'Name cannot be empty' };
      }
      if (updates.name.length > 50) {
        return { success: false, error: 'Name must be 50 characters or less' };
      }
    }

    // Validate bio if provided
    if (updates.bio !== undefined && updates.bio.length > 200) {
      return { success: false, error: 'Bio must be 200 characters or less' };
    }

    // Validate location if provided
    if (updates.location !== undefined && updates.location.length > 100) {
      return { success: false, error: 'Location must be 100 characters or less' };
    }

    // Validate website if provided
    if (updates.website !== undefined && updates.website.length > 100) {
      return { success: false, error: 'Website must be 100 characters or less' };
    }

    // Update user
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...updates,
      name: updates.name?.trim() || mockUsers[userIndex].name,
    };

    return {
      success: true,
      data: mockUsers[userIndex],
      message: 'Profile updated successfully',
    };
  },
};
