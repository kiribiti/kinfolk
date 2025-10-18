import React from 'react';
import { RefreshCw } from 'lucide-react';
import { User, Theme } from '../types';
import { mockUsers } from '../data/mockData';
import { Avatar } from './Avatar';

interface SidebarProps {
  currentUser: User;
  lastHydration: string | null;
  onHydrate: () => void;
  isHydrating: boolean;
  theme: Theme;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser, lastHydration, onHydrate, isHydrating, theme }) => {
  const suggestions = mockUsers.slice(1, 4);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4" style={{
        backgroundColor: theme.background,
        borderColor: theme.accent
      }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-sm" style={{ color: theme.text }}>Server Hydration</h3>
            <p className="text-xs text-gray-600 mt-1">
              {lastHydration ? `Last: ${lastHydration}` : 'Not synced yet'}
            </p>
          </div>
          <button
            onClick={onHydrate}
            disabled={isHydrating}
            className={`p-2 rounded-lg text-white transition-all ${
              isHydrating ? 'cursor-not-allowed opacity-50' : ''
            }`}
            style={{ backgroundColor: isHydrating ? '#9ca3af' : theme.secondary }}
          >
            <RefreshCw className={`w-5 h-5 ${isHydrating ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="text-xs text-gray-600">
          Click to fetch updates from server
        </p>
      </div>

      <div className="rounded-lg border p-6" style={{
        backgroundColor: theme.id === 'midnight' ? '#2C2C2E' : '#FFFFFF',
        borderColor: theme.accent
      }}>
        <h3 className="font-semibold mb-4" style={{ color: theme.text }}>Suggested for you</h3>
        <div className="space-y-4">
          {suggestions.map(user => (
            <div key={user.id} className="flex items-center gap-3">
              <Avatar user={user} size="sm" theme={theme} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate" style={{ color: theme.text }}>{user.name}</div>
                <div className="text-gray-500 text-xs truncate">@{user.username}</div>
              </div>
              <button
                className="px-4 py-1.5 text-white text-sm font-medium rounded-lg transition-colors"
                style={{ backgroundColor: theme.primary }}
              >
                Subscribe
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border p-6" style={{
        backgroundColor: theme.id === 'midnight' ? '#2C2C2E' : '#FFFFFF',
        borderColor: theme.accent
      }}>
        <h3 className="font-semibold mb-4" style={{ color: theme.text }}>Trending topics</h3>
        <div className="space-y-3">
          {['#community', '#heritage', '#stories', '#collective', '#memory'].map(tag => (
            <div key={tag} className="flex items-center justify-between">
              <span className="font-medium hover:underline cursor-pointer transition-colors" style={{ color: theme.primary }}>
                {tag}
              </span>
              <span className="text-gray-400 text-sm">2.4k posts</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border p-4" style={{
        backgroundColor: theme.background,
        borderColor: theme.accent
      }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.primary }}></div>
          <span className="text-sm font-semibold" style={{ color: theme.text }}>Live Activity</span>
        </div>
        <p className="text-xs text-gray-600">
          Real-time updates + server hydration
        </p>
      </div>
    </div>
  );
};
