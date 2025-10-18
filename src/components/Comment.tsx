import React, { useState } from 'react';
import { Story, Theme, User } from '../types';
import { mockUsers } from '../data/mockData';
import { Avatar } from './Avatar';

interface CommentProps {
  comment: Story;
  allStories: Story[];
  theme: Theme;
  onComment: (parentId: number, content: string) => void;
  onViewProfile?: (userId: number) => void;
  onViewStory?: (storyId: number) => void;
}

export const Comment: React.FC<CommentProps> = ({
  comment,
  allStories,
  theme,
  onComment,
  onViewProfile,
  onViewStory,
}) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const commentUser = mockUsers.find(u => u.id === comment.userId) || mockUsers[0];
  const replies = allStories.filter(s => s.parentId === comment.id);

  const handleReply = () => {
    if (replyContent.trim()) {
      onComment(comment.id, replyContent.trim());
      setReplyContent('');
      setShowReplyInput(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <button
          onClick={() => onViewProfile?.(commentUser.id)}
          className="flex-shrink-0 hover:opacity-80 transition-opacity"
        >
          <Avatar user={commentUser} size="sm" theme={theme} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => onViewProfile?.(commentUser.id)}
              className="font-semibold text-sm hover:underline"
              style={{ color: theme.text }}
            >
              {commentUser.name}
            </button>
            <button
              onClick={() => onViewProfile?.(commentUser.id)}
              className="text-gray-500 text-xs hover:underline"
            >
              @{commentUser.username}
            </button>
            <span className="text-gray-400 text-xs">·</span>
            <button
              onClick={() => onViewStory?.(comment.id)}
              className="text-gray-400 text-xs hover:underline"
            >
              {comment.timestamp}
            </button>
          </div>
          <p className="text-sm mb-2" style={{ color: theme.text }}>{comment.content}</p>

          {/* Reply button */}
          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="text-xs text-gray-500 hover:text-gray-700 font-medium"
            style={{ color: showReplyInput ? theme.primary : undefined }}
          >
            Reply {replies.length > 0 && `(${replies.length})`}
          </button>

          {/* Reply input */}
          {showReplyInput && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleReply();
                  }
                }}
                className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1"
                style={{ borderColor: theme.accent }}
                maxLength={500}
              />
              <button
                onClick={handleReply}
                disabled={!replyContent.trim()}
                className="px-3 py-1 rounded text-white text-xs font-medium transition-colors disabled:opacity-50"
                style={{ backgroundColor: theme.primary }}
              >
                Reply
              </button>
            </div>
          )}

          {/* Nested replies */}
          {replies.length > 0 && (
            <div className="mt-2 pl-4 space-y-2 border-l" style={{ borderColor: theme.accent }}>
              {replies.map(reply => {
                const replyUser = mockUsers.find(u => u.id === reply.userId) || mockUsers[0];
                return (
                  <div key={reply.id} className="flex gap-2">
                    <button
                      onClick={() => onViewProfile?.(replyUser.id)}
                      className="flex-shrink-0 hover:opacity-80 transition-opacity"
                    >
                      <Avatar user={replyUser} size="sm" theme={theme} />
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        <button
                          onClick={() => onViewProfile?.(replyUser.id)}
                          className="font-semibold text-xs hover:underline"
                          style={{ color: theme.text }}
                        >
                          {replyUser.name}
                        </button>
                        <button
                          onClick={() => onViewProfile?.(replyUser.id)}
                          className="text-gray-500 text-xs hover:underline"
                        >
                          @{replyUser.username}
                        </button>
                        <span className="text-gray-400 text-xs">·</span>
                        <button
                          onClick={() => onViewStory?.(reply.id)}
                          className="text-gray-400 text-xs hover:underline"
                        >
                          {reply.timestamp}
                        </button>
                      </div>
                      <p className="text-xs" style={{ color: theme.text }}>{reply.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
