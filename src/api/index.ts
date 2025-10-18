import { Story, User, MediaFile, Subscription } from '../types';
import { storiesDB, channelsDB, subscriptionsDB, mockUsers, formatTimestamp } from '../data/mockData';

const simulateDelay = (min = 300, max = 800): Promise<void> => {
  return new Promise(resolve =>
    setTimeout(resolve, Math.random() * (max - min) + min)
  );
};

export const ApiService = {
  async getStories() {
    await simulateDelay();
    return {
      success: true,
      data: storiesDB.map(story => ({
        ...story,
        timestamp: formatTimestamp(story.createdAt || new Date()),
      })),
    };
  },

  async createStory(userId: number, content: string, media?: MediaFile[], channelId?: number, parentId?: number) {
    await simulateDelay(400, 1000);

    if (!content || content.trim().length === 0) {
      return { success: false, error: 'Story content cannot be empty' };
    }
    if (content.length > 500) {
      return { success: false, error: 'Story content must be 500 characters or less' };
    }
    if (!channelId) {
      return { success: false, error: 'Channel ID is required' };
    }

    // If parentId is provided, verify the parent story exists
    if (parentId) {
      const parentStory = storiesDB.find(p => p.id === parentId);
      if (!parentStory) {
        return { success: false, error: 'Parent story not found' };
      }
    }

    const newStory: Story = {
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

    storiesDB.unshift(newStory);
    return { success: true, data: newStory, message: parentId ? 'Comment created successfully' : 'Story created successfully' };
  },

  async updateStory(storyId: number, content: string) {
    await simulateDelay(400, 800);

    const storyIndex = storiesDB.findIndex(p => p.id === storyId);
    if (storyIndex === -1) {
      return { success: false, error: 'Story not found' };
    }

    if (content.length > 500) {
      return { success: false, error: 'Story content must be 500 characters or less' };
    }

    storiesDB[storyIndex] = {
      ...storiesDB[storyIndex],
      content: content.trim(),
    };

    return {
      success: true,
      data: {
        ...storiesDB[storyIndex],
        timestamp: formatTimestamp(storiesDB[storyIndex].createdAt || new Date()),
      },
      message: 'Story updated successfully',
    };
  },

  async deleteStory(storyId: number, userId: number) {
    await simulateDelay(300, 600);

    const storyIndex = storiesDB.findIndex(p => p.id === storyId);
    if (storyIndex === -1) {
      return { success: false, error: 'Story not found' };
    }

    if (storiesDB[storyIndex].userId !== userId) {
      return { success: false, error: 'Unauthorized: You can only delete your own stories' };
    }

    storiesDB.splice(storyIndex, 1);
    return { success: true, message: 'Story deleted successfully' };
  },

  async toggleLike(storyId: number, userId: number) {
    await simulateDelay(200, 400);

    const storyIndex = storiesDB.findIndex(p => p.id === storyId);
    if (storyIndex === -1) {
      return { success: false, error: 'Story not found' };
    }

    const story = storiesDB[storyIndex];
    const isLiked = story.likedBy.includes(userId);

    storiesDB[storyIndex] = {
      ...story,
      likes: isLiked ? story.likes - 1 : story.likes + 1,
      likedBy: isLiked
        ? story.likedBy.filter(id => id !== userId)
        : [...story.likedBy, userId],
    };

    return {
      success: true,
      data: {
        ...storiesDB[storyIndex],
        timestamp: formatTimestamp(storiesDB[storyIndex].createdAt || new Date()),
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
