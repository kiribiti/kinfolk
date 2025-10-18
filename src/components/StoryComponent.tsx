import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Edit2, X, Check } from 'lucide-react';
import { Story, Theme, RecentActivity, User } from '../types';
import { mockUsers } from '../data/mockData';
import { Avatar } from './Avatar';
import { Comment } from './Comment';

interface StoryComponentProps{
  story: Story;
  user: User;
  onLike: (storyId: number) => void;
  onDelete: (storyId: number) => void;
  onUpdate: (storyId: number, content: string) => void;
  onComment: (parentId: number, content: string) => void;
  onViewProfile?: (userId: number) => void;
  onViewStory?: (storyId: number) => void;
  currentUserId: number;
  isHydrated: boolean;
  theme: Theme;
  allStories: Story[];
  expandComments?: boolean;
}

export const StoryComponent: React.FC<StoryComponentProps> = ({
  story,
  user,
  onLike,
  onDelete,
  onUpdate,
  onComment,
  onViewProfile,
  onViewStory,
  currentUserId,
  isHydrated,
  theme,
  allStories,
  expandComments = false
}) => {
  const [animateLike, setAnimateLike] = useState(false);
  const [animateComment, setAnimateComment] = useState(false);
  const [showComments, setShowComments] = useState(expandComments);
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
  const [isNewStory, setIsNewStory] = useState(story?.isNew || false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(story?.content || '');
  const [showMenu, setShowMenu] = useState(false);
  const [commentContent, setCommentContent] = useState('');

  // Safety check: return null if story is undefined
  if (!story || !user) {
    return null;
  }

  const isLiked = story.likedBy?.includes(currentUserId) || false;
  const isOwner = story.userId === currentUserId;

  // Get child stories (comments) for this story
  const childStories = allStories.filter(s => s.parentId === story.id);
  const commentCount = childStories.length;

  useEffect(() => {
    if (isNewStory) {
      const timer = setTimeout(() => setIsNewStory(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isNewStory]);

  useEffect(() => {
    if (story.likes !== story.previousLikes && story.previousLikes !== undefined) {
      setAnimateLike(true);
      if (story.lastActivityUserId) {
        const activityUser = mockUsers.find(u => u.id === story.lastActivityUserId);
        if (activityUser) {
          setRecentActivity({
            type: 'like',
            user: activityUser,
            action: story.likes > story.previousLikes ? 'liked' : 'unliked'
          });
        }
      }
      setTimeout(() => {
        setAnimateLike(false);
        setRecentActivity(null);
      }, 3000);
    }
  }, [story.likes, story.previousLikes, story.lastActivityUserId]);

  useEffect(() => {
    if (story.comments !== story.previousComments && story.previousComments !== undefined) {
      setAnimateComment(true);
      if (story.lastActivityUserId) {
        const activityUser = mockUsers.find(u => u.id === story.lastActivityUserId);
        if (activityUser) {
          setRecentActivity({
            type: 'comment',
            user: activityUser,
            action: 'commented'
          });
        }
      }
      setTimeout(() => {
        setAnimateComment(false);
        setRecentActivity(null);
      }, 3000);
    }
  }, [story.comments, story.previousComments, story.lastActivityUserId]);

  const handleLike = () => {
    onLike(story.id);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== story.content) {
      onUpdate(story.id, editContent);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(story.content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      onDelete(story.id);
    }
    setShowMenu(false);
  };

  const handleSubmitComment = () => {
    if (commentContent.trim()) {
      onComment(story.id, commentContent.trim());
      setCommentContent('');
    }
  };

  const handleCommentKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  return (
    <div className={`rounded-lg border p-6 transition-all relative overflow-hidden ${
      isHydrated ? 'shadow-md' : ''
    } ${isNewStory ? 'animate-slide-in' : ''}`} style={{
      backgroundColor: theme.id === 'midnight' ? '#2C2C2E' : '#FFFFFF',
      borderColor: isHydrated ? theme.primary : theme.accent
    }}>
      {isNewStory && (
        <div className="absolute top-4 right-4 text-white text-xs font-bold px-3 py-1 rounded-full" style={{
          backgroundColor: theme.primary
        }}>
          NEW
        </div>
      )}

      {isHydrated && (
        <div className="absolute top-0 left-0 right-0 h-1" style={{
          backgroundColor: theme.primary
        }}></div>
      )}

      {recentActivity && (
        <div className="absolute top-0 left-0 right-0 px-6 py-2 text-sm flex items-center gap-2 animate-slide-down" style={{
          backgroundColor: theme.background,
          borderBottom: `1px solid ${theme.accent}`,
          color: theme.text
        }}>
          <Avatar user={recentActivity.user} size="sm" theme={theme} />
          <span>
            <strong>{recentActivity.user.name}</strong> {recentActivity.action} this story
          </span>
        </div>
      )}

      <div className={`flex items-start gap-3 transition-all ${recentActivity ? 'mt-12' : ''}`}>
        <button
          onClick={() => onViewProfile?.(user.id)}
          className="flex-shrink-0 hover:opacity-80 transition-opacity"
        >
          <Avatar user={user} theme={theme} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => onViewProfile?.(user.id)}
              className="font-semibold hover:underline"
              style={{ color: theme.text }}
            >
              {user.name}
            </button>
            {user.verified && (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill={theme.primary}>
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
            )}
            <button
              onClick={() => onViewProfile?.(user.id)}
              className="text-gray-500 text-sm hover:underline"
            >
              @{user.username}
            </button>
            <span className="text-gray-400 text-sm">·</span>
            <button
              onClick={() => onViewStory?.(story.id)}
              className="text-gray-400 text-sm hover:underline"
            >
              {story.timestamp}
            </button>
          </div>

          {isEditing ? (
            <div className="mb-4">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none"
                style={{
                  borderColor: theme.accent,
                }}
                rows={3}
                maxLength={500}
              />
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={handleSaveEdit}
                  className="flex items-center gap-1 px-3 py-1.5 text-white text-sm rounded-lg transition-colors"
                  style={{ backgroundColor: theme.primary }}
                >
                  <Check className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors"
                  style={{
                    backgroundColor: theme.background,
                    color: theme.text
                  }}
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <span className="text-xs text-gray-500 ml-auto">
                  {editContent.length}/500
                </span>
              </div>
            </div>
          ) : (
            <>
              <p className="leading-relaxed mb-4" style={{ color: theme.text }}>{story.content}</p>

              {story.media && story.media.length > 0 && (
                <div className={`mb-4 grid gap-2 ${
                  story.media.length === 1 ? 'grid-cols-1' :
                  story.media.length === 2 ? 'grid-cols-2' :
                  story.media.length === 3 ? 'grid-cols-3' :
                  'grid-cols-2'
                }`}>
                  {story.media.map((file, idx) => (
                    <div key={file.id} className={`relative rounded-lg overflow-hidden ${
                      story.media!.length === 3 && idx === 0 ? 'col-span-2' : ''
                    }`}>
                      {file.type === 'image' ? (
                        <img
                          src={file.url}
                          alt="Story media"
                          className="w-full h-full object-cover max-h-96"
                        />
                      ) : (
                        <video
                          src={file.url}
                          controls
                          className="w-full h-full object-cover max-h-96"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="flex items-center gap-6 text-gray-500">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 transition-all ${animateLike ? 'scale-110' : ''}`}
              style={{ color: isLiked ? theme.primary : undefined }}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''} transition-all`} />
              <span className={`text-sm font-medium transition-all ${animateLike ? 'font-bold' : ''}`} style={{
                color: animateLike ? theme.primary : undefined
              }}>
                {story.likes}
              </span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-2 transition-all ${animateComment ? 'scale-110' : ''}`}
            >
              <MessageCircle className="w-5 h-5" />
              <span className={`text-sm font-medium transition-all ${animateComment ? 'font-bold' : ''}`} style={{
                color: animateComment ? theme.secondary : undefined
              }}>
                {commentCount}
              </span>
            </button>

            <button className="flex items-center gap-2 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>

            {isOwner && (
              <div className="ml-auto relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border py-1 z-10" style={{
                    backgroundColor: theme.id === 'midnight' ? '#2C2C2E' : '#FFFFFF',
                    borderColor: theme.accent
                  }}>
                    <button
                      onClick={handleEdit}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      style={{ color: theme.text }}
                      onMouseOver={(e) => theme.id === 'midnight' && (e.currentTarget.style.backgroundColor = '#3C3C3E')}
                      onMouseOut={(e) => theme.id === 'midnight' && (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit story
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      onMouseOver={(e) => theme.id === 'midnight' && (e.currentTarget.style.backgroundColor = '#3C3C3E')}
                      onMouseOut={(e) => theme.id === 'midnight' && (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete story
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {showComments && (
            <div className="mt-4 pt-4 border-t space-y-4" style={{ borderColor: theme.accent }}>
              {/* Comment input */}
              <div className="flex gap-3">
                <Avatar user={mockUsers.find(u => u.id === currentUserId) || mockUsers[0]} size="sm" theme={theme} />
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    onKeyPress={handleCommentKeyPress}
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{
                      borderColor: theme.accent,
                    }}
                    maxLength={500}
                  />
                  <button
                    onClick={handleSubmitComment}
                    disabled={!commentContent.trim()}
                    className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50"
                    style={{
                      backgroundColor: theme.primary
                    }}
                  >
                    Post
                  </button>
                </div>
              </div>

              {/* Display child stories (comments) */}
              {childStories.length > 0 && (
                <div className="space-y-3 pl-4 border-l-2" style={{ borderColor: theme.accent }}>
                  {childStories.map(childStory => (
                    <Comment
                      key={childStory.id}
                      comment={childStory}
                      allStories={allStories}
                      theme={theme}
                      onComment={onComment}
                      onViewProfile={onViewProfile}
                      onViewStory={onViewStory}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes slide-in {
          from {
            transform: translateX(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        .animate-slide-in {
          animation: slide-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};
