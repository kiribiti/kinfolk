// ============================================
// THEME SYSTEM
// ============================================

export interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export const themes: Theme[] = [
  {
    id: 'kinfolk',
    name: 'Kinfolk Heritage',
    primary: '#D4AF37',
    secondary: '#2C1810',
    accent: '#E8DCC4',
    background: '#F5F2ED',
    text: '#1A1512',
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    primary: '#0077BE',
    secondary: '#003D5C',
    accent: '#B3D9ED',
    background: '#F0F8FF',
    text: '#002B3D',
  },
  {
    id: 'forest',
    name: 'Forest Green',
    primary: '#2D5016',
    secondary: '#1A3010',
    accent: '#C8E6C9',
    background: '#F1F8E9',
    text: '#1B5E20',
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    primary: '#FF6B35',
    secondary: '#8B3A00',
    accent: '#FFE5D9',
    background: '#FFF5F0',
    text: '#5C2E00',
  },
  {
    id: 'lavender',
    name: 'Lavender Dreams',
    primary: '#9B59B6',
    secondary: '#6C3483',
    accent: '#E8DAEF',
    background: '#F4ECF7',
    text: '#4A235A',
  },
  {
    id: 'coral',
    name: 'Coral Reef',
    primary: '#FF7F50',
    secondary: '#CD5C5C',
    accent: '#FFE4E1',
    background: '#FFF5EE',
    text: '#8B4513',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    primary: '#4A90E2',
    secondary: '#2C3E50',
    accent: '#34495E',
    background: '#1C1C1E',
    text: '#FFFFFF',
  },
  {
    id: 'rose',
    name: 'Rose Garden',
    primary: '#E91E63',
    secondary: '#AD1457',
    accent: '#F8BBD0',
    background: '#FCE4EC',
    text: '#880E4F',
  },
];

// ============================================
// TYPES & INTERFACES
// ============================================

export interface Post {
  id: number;
  userId: number;
  channelId: number;
  parentId?: number; // If set, this post is a comment on another post
  content: string;
  timestamp: string;
  createdAt?: Date;
  likes: number;
  comments: number; // Calculated count of child posts
  likedBy: number[];
  previousLikes?: number;
  previousComments?: number;
  lastActivityUserId?: number;
  isNew?: boolean;
  media?: MediaFile[];
}

export interface MediaFile {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}

export interface Channel {
  id: number;
  platformId: number;
  userId: number;
  name: string;
  description?: string;
  isPrimary: boolean;
  isPrivate: boolean;
  subscriberCount: number;
  postCount: number;
  createdAt: Date;
}

export interface Subscription {
  id: number;
  subscriberId: number;
  channelId: number;
  status: 'active' | 'pending' | 'denied';
  requestMessage?: string;
  createdAt: Date;
  approvedAt?: Date;
}

export interface User {
  id: number;
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
  themeId?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinedDate?: string;
  subscribers?: number;
  subscriptions?: number;
  defaultChannelId?: number;
}

export interface Activity {
  action: 'like' | 'unlike' | 'comment';
  postId: number;
  userId: number;
}

export interface RecentActivity {
  type: 'like' | 'comment';
  user: User;
  action: string;
}

export interface HydrationPayload {
  timestamp: number;
  updates: PostUpdate[];
  newPosts: Post[];
  deletedPostIds: number[];
  message: string;
}

export interface PostUpdate {
  id: number;
  likes: number;
  comments: number;
  likedBy?: number[];
}

export type TabType = 'home' | 'notifications' | 'profile';
export type AvatarSize = 'sm' | 'md' | 'lg';
