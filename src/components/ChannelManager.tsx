import React, { useState } from 'react';
import { X, Edit2, Trash2, Plus, Lock, Globe, User as UserIcon } from 'lucide-react';
import { Channel, User, Theme } from '../types';
import { PLATFORM_ID } from '../data/mockData';
import { ApiService as api } from '../api';
import { SubscriberList } from './SubscriberList';

interface ChannelManagerProps {
  user: User;
  channels: Channel[];
  theme: Theme;
  onClose: () => void;
  onChannelCreated: (channel: Channel) => void;
  onChannelUpdated: (channel: Channel) => void;
  onChannelDeleted: (channelId: number) => void;
}

export const ChannelManager: React.FC<ChannelManagerProps> = ({
  user,
  channels,
  theme,
  onClose,
  onChannelCreated,
  onChannelUpdated,
  onChannelDeleted
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [viewingSubscribersChannel, setViewingSubscribersChannel] = useState<Channel | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false
  });

  const userChannels = channels.filter(c => c.userId === user.id);
  const canCreateMore = userChannels.length < 3;

  const handleRemoveSubscriber = async (subscriberId: number) => {
    if (!viewingSubscribersChannel) return;

    const response = await api.removeSubscriber(
      viewingSubscribersChannel.id,
      subscriberId,
      user.id
    );

    if (response.success) {
      // Update the channel's subscriber count in local state
      const updatedChannel = {
        ...viewingSubscribersChannel,
        subscriberCount: Math.max(0, viewingSubscribersChannel.subscriberCount - 1)
      };
      onChannelUpdated(updatedChannel);
      setViewingSubscribersChannel(updatedChannel);
    }
  };

  const handleCreate = () => {
    if (!formData.name.trim()) return;

    const newChannel: Channel = {
      id: Date.now(),
      platformId: PLATFORM_ID,
      userId: user.id,
      name: formData.name,
      description: formData.description,
      isPrimary: false,
      isPrivate: formData.isPrivate,
      subscriberCount: 0,
      storyCount: 0,
      createdAt: new Date()
    };

    onChannelCreated(newChannel);
    setIsCreating(false);
    setFormData({ name: '', description: '', isPrivate: false });
  };

  const handleUpdate = () => {
    if (!editingChannel) return;

    const updated: Channel = {
      ...editingChannel,
      name: formData.name,
      description: formData.description,
      isPrivate: formData.isPrivate
    };

    onChannelUpdated(updated);
    setEditingChannel(null);
    setFormData({ name: '', description: '', isPrivate: false });
  };

  const startEdit = (channel: Channel) => {
    setEditingChannel(channel);
    setFormData({
      name: channel.name,
      description: channel.description || '',
      isPrivate: channel.isPrivate
    });
  };

  const handleDelete = (channel: Channel) => {
    if (channel.isPrimary) return;
    if (window.confirm(`Delete "${channel.name}"? This will also delete all stories in this channel.`)) {
      onChannelDeleted(channel.id);
    }
  };

  return (
    <>
      {viewingSubscribersChannel && (
        <SubscriberList
          channel={viewingSubscribersChannel}
          theme={theme}
          onClose={() => setViewingSubscribersChannel(null)}
          onRemoveSubscriber={handleRemoveSubscriber}
        />
      )}

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" style={{
          backgroundColor: theme.id === 'midnight' ? '#2C2C2E' : '#FFFFFF'
        }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: theme.text }}>Manage Channels</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-6 h-6" style={{ color: theme.text }} />
            </button>
          </div>

          {/* Existing Channels */}
          <div className="space-y-3 mb-6">
            {userChannels.map(channel => (
              <div key={channel.id} className="border rounded-lg p-4" style={{
                borderColor: theme.accent,
                backgroundColor: theme.id === 'midnight' ? '#1C1C1E' : theme.background
              }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold" style={{ color: theme.text }}>
                        {channel.name}
                      </h3>
                      {channel.isPrimary && (
                        <span className="text-xs px-2 py-1 rounded" style={{
                          backgroundColor: theme.primary + '20',
                          color: theme.primary
                        }}>
                          Primary
                        </span>
                      )}
                      {channel.isPrivate ? (
                        <Lock className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Globe className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                    {channel.description && (
                      <p className="text-sm text-gray-500 mb-2">{channel.description}</p>
                    )}
                    <div className="flex gap-4 text-xs text-gray-500 mb-3">
                      <span>{channel.storyCount} stories</span>
                      <span>{channel.subscriberCount} subscribers</span>
                    </div>
                    <button
                      onClick={() => setViewingSubscribersChannel(channel)}
                      className="text-xs px-3 py-1.5 rounded-lg border transition-colors hover:bg-gray-50"
                      style={{
                        borderColor: theme.accent,
                        color: theme.primary
                      }}
                    >
                      <UserIcon className="w-3 h-3 inline mr-1" />
                      View Subscribers
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(channel)}
                      className="p-2 hover:bg-gray-100 rounded"
                      style={{ color: theme.text }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {!channel.isPrimary && (
                      <button
                        onClick={() => handleDelete(channel)}
                        className="p-2 hover:bg-red-50 rounded text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

        {/* Create/Edit Form */}
        {(isCreating || editingChannel) && (
          <div className="border rounded-lg p-4 mb-4" style={{
            borderColor: theme.accent,
            backgroundColor: theme.id === 'midnight' ? '#1C1C1E' : theme.background
          }}>
            <h3 className="font-semibold mb-4" style={{ color: theme.text }}>
              {editingChannel ? 'Edit Channel' : 'Create New Channel'}
            </h3>

            <input
              type="text"
              placeholder="Channel name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={editingChannel?.isPrimary}
              className="w-full px-4 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2"
              style={{
                borderColor: theme.accent,
                backgroundColor: theme.id === 'midnight' ? '#2C2C2E' : '#FFFFFF',
                color: theme.text
              }}
              maxLength={50}
            />

            <textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 resize-none"
              style={{
                borderColor: theme.accent,
                backgroundColor: theme.id === 'midnight' ? '#2C2C2E' : '#FFFFFF',
                color: theme.text
              }}
              rows={2}
              maxLength={200}
            />

            <label className="flex items-center gap-2 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPrivate}
                onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm" style={{ color: theme.text }}>
                Make this channel private
              </span>
            </label>

            <div className="flex gap-2">
              <button
                onClick={editingChannel ? handleUpdate : handleCreate}
                disabled={!formData.name.trim()}
                className="px-4 py-2 text-white rounded-lg disabled:bg-gray-300"
                style={{ backgroundColor: formData.name.trim() ? theme.primary : undefined }}
              >
                {editingChannel ? 'Update' : 'Create'}
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingChannel(null);
                  setFormData({ name: '', description: '', isPrivate: false });
                }}
                className="px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: theme.background,
                  color: theme.text
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Create Button */}
        {!isCreating && !editingChannel && canCreateMore && (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full py-3 border-2 border-dashed rounded-lg font-medium transition-colors"
            style={{
              borderColor: theme.accent,
              color: theme.primary
            }}
          >
            <Plus className="w-5 h-5 inline mr-2" />
            Create New Channel ({userChannels.length}/3)
          </button>
        )}

        {!canCreateMore && !isCreating && !editingChannel && (
          <p className="text-center text-sm text-gray-500">
            You've reached the maximum of 3 channels
          </p>
        )}
        </div>
      </div>
    </>
  );
};
