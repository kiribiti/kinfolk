import { User, Channel, Subscription, Post, Activity, HydrationPayload, PostUpdate } from '../types';

// ============================================
// MOCK DATA
// ============================================

export const PLATFORM_ID = 1; // Default platform for this demo

export let channelsDB: Channel[] = [];
export let nextChannelId = 1;
export let subscriptionsDB: Subscription[] = [];
export let nextSubscriptionId = 1;
export let postsDB: Post[] = [];
export let nextPostId = 1;

export const mockUsers: User[] = [
  {
    id: 1,
    name: 'Sarah Chen',
    username: 'sarahchen',
    avatar: '👩‍💻',
    verified: true,
    bio: 'Software engineer building the future. Passionate about open source and clean code.',
    location: 'San Francisco, CA',
    website: 'sarahchen.dev',
    joinedDate: 'January 2023',
    subscribers: 1234,
    subscriptions: 567
  },
  {
    id: 2,
    name: 'Alex Rivera',
    username: 'alexr',
    avatar: '👨‍🎨',
    verified: false,
    bio: 'Designer & creative technologist',
    location: 'Brooklyn, NY',
    subscribers: 892,
    subscriptions: 345
  },
  {
    id: 3,
    name: 'Maya Patel',
    username: 'mayap',
    avatar: '👩‍🔬',
    verified: true,
    bio: 'Research scientist exploring AI ethics',
    location: 'London, UK',
    subscribers: 2341,
    subscriptions: 234
  },
  {
    id: 4,
    name: 'Jordan Lee',
    username: 'jordanl',
    avatar: '👨‍💼',
    verified: false,
    bio: 'Product manager at tech startup',
    subscribers: 456,
    subscriptions: 789
  },
  {
    id: 5,
    name: 'Sam Taylor',
    username: 'samtay',
    avatar: '👩‍🚀',
    verified: true,
    bio: 'Space enthusiast & aerospace engineer',
    location: 'Houston, TX',
    website: 'samtaylor.space',
    subscribers: 3456,
    subscriptions: 123
  },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

// Initialize with sample data
export const initializeDB = () => {
  // Reset counters
  nextChannelId = 1;
  nextPostId = 1;
  nextSubscriptionId = 1;

  // Initialize channels for each user
  mockUsers.forEach(user => {
    const primaryChannel: Channel = {
      id: nextChannelId++,
      platformId: PLATFORM_ID,
      userId: user.id,
      name: user.name,
      description: `${user.name}'s primary channel`,
      isPrimary: true,
      isPrivate: false,
      subscriberCount: user.subscribers || 0,
      postCount: 0,
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
    };
    channelsDB.push(primaryChannel);
    user.defaultChannelId = primaryChannel.id;
  });

  // Add some additional channels for certain users
  const sarahArchiveChannel: Channel = {
    id: nextChannelId++,
    platformId: PLATFORM_ID,
    userId: 1,
    name: 'Archive Stories',
    description: 'Historical projects and research',
    isPrimary: false,
    isPrivate: false,
    subscriberCount: 234,
    postCount: 0,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  };
  channelsDB.push(sarahArchiveChannel);

  const mayaResearchChannel: Channel = {
    id: nextChannelId++,
    platformId: PLATFORM_ID,
    userId: 3,
    name: 'AI Ethics Research',
    description: 'In-depth research papers and findings',
    isPrimary: false,
    isPrivate: true,
    subscriberCount: 89,
    postCount: 0,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
  };
  channelsDB.push(mayaResearchChannel);

  const initialPosts = [
    {
      userId: 1,
      content: 'Just shipped a new feature that reduces API response time by 40%! Sometimes the best optimizations come from questioning your assumptions. What\'s your recent win?',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      userId: 3,
      content: 'Interesting observation: The best code reviews aren\'t about finding bugs—they\'re about sharing knowledge and building team culture. Changed my whole approach this year.',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      userId: 2,
      content: 'Hot take: Design systems are overrated for small teams. You end up spending more time maintaining the system than actually building features. Thoughts?',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
    {
      userId: 5,
      content: 'Deployed to production on a Friday afternoon. Living dangerously. 🚀',
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    },
    {
      userId: 4,
      content: 'After 3 years of remote work, I finally understand why senior devs always said "just talk to your team." Async communication is great, but some problems need a 5-minute call.',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
  ];

  initialPosts.forEach(post => {
    const userChannel = channelsDB.find(c => c.userId === post.userId && c.isPrimary);
    if (userChannel) {
      postsDB.push({
        id: nextPostId++,
        userId: post.userId,
        channelId: userChannel.id,
        content: post.content,
        timestamp: formatTimestamp(post.createdAt),
        createdAt: post.createdAt,
        likes: Math.floor(Math.random() * 200),
        comments: Math.floor(Math.random() * 50),
        likedBy: Math.random() > 0.5 ? [1] : [],
      });
      userChannel.postCount++;
    }
  });

  // Add mock comments to posts
  const mockComments = [
    // Comments for post 1 (Sarah's optimization post)
    {
      parentId: 1,
      userId: 2,
      content: 'That\'s impressive! Did you use caching or database query optimization?',
      createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    },
    {
      parentId: 1,
      userId: 3,
      content: 'Nice work! Would love to hear more about your approach.',
      createdAt: new Date(Date.now() - 1.8 * 60 * 60 * 1000),
    },
    {
      parentId: 1,
      userId: 4,
      content: 'This is exactly what we need on our project. Mind sharing some details?',
      createdAt: new Date(Date.now() - 1.2 * 60 * 60 * 1000),
    },

    // Comments for post 2 (Maya's code review post)
    {
      parentId: 2,
      userId: 1,
      content: 'Completely agree! The collaborative aspect is often overlooked.',
      createdAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
    },
    {
      parentId: 2,
      userId: 5,
      content: 'This resonates with me. Changed how I approach reviews last month.',
      createdAt: new Date(Date.now() - 3.8 * 60 * 60 * 1000),
    },
    {
      parentId: 2,
      userId: 4,
      content: 'Great perspective. We should make this part of our team culture.',
      createdAt: new Date(Date.now() - 3.2 * 60 * 60 * 1000),
    },
    {
      parentId: 2,
      userId: 2,
      content: 'Yes! Also helps junior devs learn faster.',
      createdAt: new Date(Date.now() - 3.7 * 60 * 60 * 1000),
    },

    // Comments for post 3 (Alex's design systems hot take)
    {
      parentId: 3,
      userId: 1,
      content: 'Interesting take. I think it depends on the team\'s growth trajectory.',
      createdAt: new Date(Date.now() - 5.5 * 60 * 60 * 1000),
    },
    {
      parentId: 3,
      userId: 3,
      content: 'Hard disagree. Even small teams benefit from consistency.',
      createdAt: new Date(Date.now() - 5.3 * 60 * 60 * 1000),
    },
    {
      parentId: 3,
      userId: 5,
      content: 'Maybe start simple? A basic color palette and typography system goes a long way.',
      createdAt: new Date(Date.now() - 5.7 * 60 * 60 * 1000),
    },

    // Comments for post 4 (Sam's Friday deployment)
    {
      parentId: 4,
      userId: 1,
      content: 'Bold move! Hope you have good rollback procedures in place 😅',
      createdAt: new Date(Date.now() - 7.5 * 60 * 60 * 1000),
    },
    {
      parentId: 4,
      userId: 3,
      content: 'Living on the edge! Good luck 🤞',
      createdAt: new Date(Date.now() - 7.3 * 60 * 60 * 1000),
    },
    {
      parentId: 4,
      userId: 2,
      content: 'This is why we can\'t have nice weekends 😂',
      createdAt: new Date(Date.now() - 7.8 * 60 * 60 * 1000),
    },
    {
      parentId: 4,
      userId: 4,
      content: 'Respect! Though my heart rate just increased reading this.',
      createdAt: new Date(Date.now() - 7.2 * 60 * 60 * 1000),
    },

    // Comments for post 5 (Jordan's remote work insight)
    {
      parentId: 5,
      userId: 2,
      content: 'So true. Some things just need real-time conversation.',
      createdAt: new Date(Date.now() - 11.5 * 60 * 60 * 1000),
    },
    {
      parentId: 5,
      userId: 3,
      content: 'The trick is knowing when to switch modes. Still learning this myself.',
      createdAt: new Date(Date.now() - 11.3 * 60 * 60 * 1000),
    },
    {
      parentId: 5,
      userId: 5,
      content: 'Async is great for documentation, sync is great for collaboration.',
      createdAt: new Date(Date.now() - 11.7 * 60 * 60 * 1000),
    },
  ];

  mockComments.forEach(comment => {
    const parentPost = postsDB.find(p => p.id === comment.parentId);
    if (parentPost) {
      postsDB.push({
        id: nextPostId++,
        userId: comment.userId,
        channelId: parentPost.channelId,
        parentId: comment.parentId,
        content: comment.content,
        timestamp: formatTimestamp(comment.createdAt),
        createdAt: comment.createdAt,
        likes: Math.floor(Math.random() * 50),
        comments: 0,
        likedBy: Math.random() > 0.5 ? [1] : [],
      });
    }
  });

  // Add nested replies (replies to comments)
  const nestedReplies = [
    // Replies to comment 6 (Alex asking about Sarah's optimization)
    {
      parentId: 6,
      userId: 1,
      content: 'Combination of both! Added Redis caching and optimized some N+1 queries.',
      createdAt: new Date(Date.now() - 1.4 * 60 * 60 * 1000),
    },
    {
      parentId: 6,
      userId: 3,
      content: 'Would love a write-up on this!',
      createdAt: new Date(Date.now() - 1.3 * 60 * 60 * 1000),
    },

    // Reply to comment 14 (Maya's hard disagree about design systems)
    {
      parentId: 14,
      userId: 2,
      content: 'Fair point! Maybe I just had a bad experience with an overly complex system.',
      createdAt: new Date(Date.now() - 5.2 * 60 * 60 * 1000),
    },

    // Replies to comment 17 (Maya's "Living on the edge!")
    {
      parentId: 17,
      userId: 5,
      content: 'Update: It went smoothly! 🎉',
      createdAt: new Date(Date.now() - 7.1 * 60 * 60 * 1000),
    },
    {
      parentId: 17,
      userId: 1,
      content: 'Crisis averted! Nice work.',
      createdAt: new Date(Date.now() - 7.0 * 60 * 60 * 1000),
    },

    // Reply to comment 21 (Maya about switching modes)
    {
      parentId: 21,
      userId: 4,
      content: 'Exactly! I use async for thinking time, sync for problem solving.',
      createdAt: new Date(Date.now() - 11.2 * 60 * 60 * 1000),
    },
  ];

  nestedReplies.forEach(reply => {
    const parentComment = postsDB.find(p => p.id === reply.parentId);
    if (parentComment) {
      postsDB.push({
        id: nextPostId++,
        userId: reply.userId,
        channelId: parentComment.channelId,
        parentId: reply.parentId,
        content: reply.content,
        timestamp: formatTimestamp(reply.createdAt),
        createdAt: reply.createdAt,
        likes: Math.floor(Math.random() * 25),
        comments: 0,
        likedBy: Math.random() > 0.5 ? [1] : [],
      });
    }
  });

  // Add some initial subscriptions
  // Sarah's primary channel subscribers
  const sarahChannel = channelsDB.find(c => c.userId === 1 && c.isPrimary);
  if (sarahChannel) {
    [2, 3, 4, 5].forEach((userId, index) => {
      subscriptionsDB.push({
        id: nextSubscriptionId++,
        subscriberId: userId,
        channelId: sarahChannel.id,
        status: 'active',
        createdAt: new Date(Date.now() - (30 - index * 5) * 24 * 60 * 60 * 1000),
        approvedAt: new Date(Date.now() - (30 - index * 5) * 24 * 60 * 60 * 1000),
      });
    });
  }

  // Sarah's Archive Stories channel subscribers
  const archiveChannel = channelsDB.find(c => c.userId === 1 && c.name === 'Archive Stories');
  if (archiveChannel) {
    [3, 4].forEach((userId, index) => {
      subscriptionsDB.push({
        id: nextSubscriptionId++,
        subscriberId: userId,
        channelId: archiveChannel.id,
        status: 'active',
        createdAt: new Date(Date.now() - (20 - index * 3) * 24 * 60 * 60 * 1000),
        approvedAt: new Date(Date.now() - (20 - index * 3) * 24 * 60 * 60 * 1000),
      });
    });
  }

  // Maya's private research channel subscribers
  const mayaResearch = channelsDB.find(c => c.userId === 3 && c.name === 'AI Ethics Research');
  if (mayaResearch) {
    [1, 5].forEach((userId, index) => {
      subscriptionsDB.push({
        id: nextSubscriptionId++,
        subscriberId: userId,
        channelId: mayaResearch.id,
        status: 'active',
        createdAt: new Date(Date.now() - (15 - index * 2) * 24 * 60 * 60 * 1000),
        approvedAt: new Date(Date.now() - (15 - index * 2) * 24 * 60 * 60 * 1000),
      });
    });
  }
};

// ============================================
// ACTIVITY SIMULATOR
// ============================================

export class ActivitySimulator {
  private callback: (activity: Activity) => void;
  private interval: number | null = null;

  constructor(callback: (activity: Activity) => void) {
    this.callback = callback;
  }

  start(): void {
    this.interval = window.setInterval(() => {
      const actions: Activity['action'][] = ['like', 'unlike', 'comment'];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const postId = Math.floor(Math.random() * 10) + 1;
      const userId = Math.floor(Math.random() * 5) + 1;

      this.callback({ action, postId, userId });
    }, Math.random() * 5000 + 3000);
  }

  stop(): void {
    if (this.interval !== null) {
      clearInterval(this.interval);
    }
  }
}

// ============================================
// MOCK SERVER
// ============================================

export class MockServer {
  private lastHydrationTime: number;

  constructor() {
    this.lastHydrationTime = Date.now();
  }

  async fetchHydration(currentPosts: Post[]): Promise<HydrationPayload> {
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

    const updates: PostUpdate[] = [];
    const newPosts: Post[] = [];
    const deletedPostIds: number[] = [];

    currentPosts.forEach(post => {
      if (Math.random() > 0.7) {
        const likeChange = Math.floor(Math.random() * 10) - 3;
        const commentChange = Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0;

        updates.push({
          id: post.id,
          likes: Math.max(0, post.likes + likeChange),
          comments: post.comments + commentChange,
          likedBy: post.likedBy,
        });
      }
    });

    return {
      timestamp: Date.now(),
      updates,
      newPosts,
      deletedPostIds,
      message: updates.length > 0 || newPosts.length > 0 || deletedPostIds.length > 0
        ? `Updated ${updates.length} post${updates.length !== 1 ? 's' : ''}, added ${newPosts.length} new post${newPosts.length !== 1 ? 's' : ''}, removed ${deletedPostIds.length} post${deletedPostIds.length !== 1 ? 's' : ''}`
        : 'Feed is up to date',
    };
  }
}
