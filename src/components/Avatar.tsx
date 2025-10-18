import React from 'react';
import { User, Theme, AvatarSize } from '../types';

interface AvatarProps {
  user: User;
  size?: AvatarSize;
  theme: Theme;
}

export const Avatar: React.FC<AvatarProps> = ({ user, size = 'md', theme }) => {
  const sizeClasses: Record<AvatarSize, string> = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-10 h-10 text-xl',
    lg: 'w-12 h-12 text-2xl',
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center flex-shrink-0`} style={{
      background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`
    }}>
      <span>{user.avatar}</span>
    </div>
  );
};
