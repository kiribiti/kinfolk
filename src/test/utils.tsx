import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { Theme, themes, User, Post } from '../types';
import { mockUsers as mockUsersFromData } from '../data/mockData';

// Mock theme
export const mockTheme: Theme = themes[0];

// Re-export mockUsers from mockData for tests
export const mockUsers = mockUsersFromData;

// Mock users
export const mockUser: User = {
  id: 1,
  name: 'Test User',
  username: 'testuser',
  avatar: '👤',
  verified: false,
  bio: 'Test bio',
  location: 'Test City',
  website: 'test.com',
  joinedDate: 'January 2024',
  subscribers: 100,
  subscriptions: 50,
};

export const mockVerifiedUser: User = {
  id: 2,
  name: 'Verified User',
  username: 'verified',
  avatar: '✅',
  verified: true,
  subscribers: 1000,
  subscriptions: 100,
};

// Mock posts
export const mockPost: Post = {
  id: 1,
  userId: 1,
  channelId: 1,
  content: 'Test post content',
  timestamp: '5m ago',
  createdAt: new Date(Date.now() - 5 * 60 * 1000),
  likes: 10,
  comments: 5,
  likedBy: [],
};

export const mockPostWithComment: Post = {
  id: 2,
  userId: 1,
  channelId: 1,
  parentId: 1,
  content: 'Test comment',
  timestamp: '3m ago',
  createdAt: new Date(Date.now() - 3 * 60 * 1000),
  likes: 2,
  comments: 0,
  likedBy: [],
};

// Custom render function with default props
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  theme?: Theme;
}

export function renderWithTheme(
  ui: ReactElement,
  { theme = mockTheme, ...options }: CustomRenderOptions = {}
) {
  return render(ui, options);
}

// Re-export everything from testing library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
