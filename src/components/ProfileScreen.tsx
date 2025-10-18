import React, { useState } from 'react';
import { Heart, MessageCircle, Camera, Settings, MapPin, ExternalLink, Calendar } from 'lucide-react';
import { User, Theme, Story } from '../types';
import { StoryComponent } from './StoryComponent';
import { EditProfileModal } from './EditProfileModal';

interface ProfileScreenProps {
  user: User;
  currentUser: User;
  theme: Theme;
  stories: Story[];
  onLike: (storyId: number) => void;
  onDelete: (storyId: number) => void;
  onUpdate: (storyId: number, content: string) => void;
  onComment: (parentId: number, content: string) => void;
  onViewProfile?: (userId: number) => void;
  onViewStory?: (storyId: number) => void;
  onUserUpdate: (updatedUser: User) => void;
  hydratedPostIds: Set<number>;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  currentUser,
  theme,
  stories,
  onLike,
  onDelete,
  onUpdate,
  onComment,
  onViewProfile,
  onViewStory,
  onUserUpdate,
  hydratedPostIds
}) => {
  const [activeProfileTab, setActiveProfileTab] = useState<'stories' | 'media' | 'likes'>('stories');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const isOwnProfile = user.id === currentUser.id;
  const userStories = stories.filter(p => p.userId === user.id);
  const userMediaStories = userStories.filter(p => p.media && p.media.length > 0);

  const handleSaveProfile = (updatedFields: Partial<User>) => {
    const updatedUser = { ...user, ...updatedFields };
    onUserUpdate(updatedUser);
  };

  const formatNumber = (num: number = 0) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <>
      {isEditing && (
        <EditProfileModal
          user={user}
          theme={theme}
          onClose={() => setIsEditing(false)}
          onSave={handleSaveProfile}
        />
      )}

      <div className="space-y-6">
        {/* Profile Header */}
        <div className="rounded-lg border p-6" style={{
          backgroundColor: theme.id === 'midnight' ? '#2C2C2E' : '#FFFFFF',
          borderColor: theme.accent
        }}>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl" style={{
              background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`
            }}>
              {user.avatar}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
                    {user.name}
                  </h1>
                  {user.verified && (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill={theme.primary}>
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                  )}
                </div>
                <p className="text-gray-500 mb-3">@{user.username}</p>

                {user.bio && (
                  <p className="mb-3" style={{ color: theme.text }}>{user.bio}</p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  {user.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  {user.website && (
                    <div className="flex items-center gap-1">
                      <ExternalLink className="w-4 h-4" />
                      <a href={`https://${user.website}`} className="hover:underline" style={{ color: theme.primary }}>
                        {user.website}
                      </a>
                    </div>
                  )}
                  {user.joinedDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {user.joinedDate}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-row gap-2">
                {isOwnProfile ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-2 py-2 rounded-lg font-medium transition-colors"
                    style={{
                      borderColor: theme.accent,
                      color: theme.text
                    }}
                  >
                    <Settings className="w-4 h-4 inline" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsSubscribed(!isSubscribed)}
                      className="px-6 py-2 rounded-lg font-medium transition-colors text-white"
                      style={{
                        backgroundColor: isSubscribed ? theme.secondary : theme.primary
                      }}
                    >
                      {isSubscribed ? 'Subscribed' : 'Subscribe'}
                    </button>
                    <button
                      className="px-4 py-2 rounded-lg border font-medium transition-colors"
                      style={{
                        borderColor: theme.accent,
                        color: theme.text
                      }}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 pt-4 border-t" style={{ borderColor: theme.accent }}>
              <div>
                <span className="font-bold text-lg" style={{ color: theme.text }}>
                  {userStories.length}
                </span>
                <span className="text-gray-500 ml-1">Stories</span>
              </div>
              <div>
                <span className="font-bold text-lg" style={{ color: theme.text }}>
                  {formatNumber(user.subscribers)}
                </span>
                <span className="text-gray-500 ml-1">Subscribers</span>
              </div>
              <div>
                <span className="font-bold text-lg" style={{ color: theme.text }}>
                  {formatNumber(user.subscriptions)}
                </span>
                <span className="text-gray-500 ml-1">Subscriptions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="rounded-lg border" style={{
        backgroundColor: theme.id === 'midnight' ? '#2C2C2E' : '#FFFFFF',
        borderColor: theme.accent
      }}>
        <div className="flex border-b" style={{ borderColor: theme.accent }}>
          <button
            onClick={() => setActiveProfileTab('stories')}
            className="flex-1 px-6 py-4 font-medium transition-colors"
            style={{
              color: activeProfileTab === 'stories' ? theme.primary : theme.text,
              borderBottom: activeProfileTab === 'stories' ? `2px solid ${theme.primary}` : 'none'
            }}
          >
            Stories
          </button>
          <button
            onClick={() => setActiveProfileTab('media')}
            className="flex-1 px-6 py-4 font-medium transition-colors"
            style={{
              color: activeProfileTab === 'media' ? theme.primary : theme.text,
              borderBottom: activeProfileTab === 'media' ? `2px solid ${theme.primary}` : 'none'
            }}
          >
            Media
          </button>
          <button
            onClick={() => setActiveProfileTab('likes')}
            className="flex-1 px-6 py-4 font-medium transition-colors"
            style={{
              color: activeProfileTab === 'likes' ? theme.primary : theme.text,
              borderBottom: activeProfileTab === 'likes' ? `2px solid ${theme.primary}` : 'none'
            }}
          >
            Likes
          </button>
        </div>

        <div className="p-6">
          {activeProfileTab === 'stories' && (
            <div className="space-y-4">
              {userStories.length > 0 ? (
                userStories.filter(p => !p.parentId).map(post => (
                  <StoryComponent
                    key={post.id}
                    story={post}
                    user={user}
                    onLike={onLike}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                    onComment={onComment}
                    onViewProfile={onViewProfile}
                    onViewStory={onViewStory}
                    currentUserId={currentUser.id}
                    isHydrated={hydratedPostIds.has(post.id)}
                    theme={theme}
                    allStories={stories}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No stories yet</p>
                </div>
              )}
            </div>
          )}

          {activeProfileTab === 'media' && (
            <div>
              {userMediaStories.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {userMediaStories.map(post =>
                    post.media?.map(file => (
                      <div key={file.id} className="aspect-square rounded-lg overflow-hidden">
                        {file.type === 'image' ? (
                          <img src={file.url} alt="Media" className="w-full h-full object-cover" />
                        ) : (
                          <video src={file.url} className="w-full h-full object-cover" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No media yet</p>
                </div>
              )}
            </div>
          )}

          {activeProfileTab === 'likes' && (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Liked stories appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>

    </>
  );
};
