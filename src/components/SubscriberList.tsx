import React, { useState, useEffect } from 'react';
import { X, RefreshCw, User as UserIcon } from 'lucide-react';
import { User, Theme, Channel } from '../types';
import { ApiService as api } from '../api';
import { Avatar } from './Avatar';
import { ConfirmModal } from './ConfirmModal';

interface SubscriberListProps {
  channel: Channel;
  theme: Theme;
  onClose: () => void;
  onRemoveSubscriber: (subscriberId: number) => void;
}

export const SubscriberList: React.FC<SubscriberListProps> = ({
  channel,
  theme,
  onClose,
  onRemoveSubscriber
}) => {
  const [subscribers, setSubscribers] = useState<(User & { subscribedAt?: Date })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmRemove, setConfirmRemove] = useState<{ show: boolean; subscriber: User | null }>({
    show: false,
    subscriber: null
  });

  useEffect(() => {
    loadSubscribers();
  }, [channel.id]);

  const loadSubscribers = async () => {
    setIsLoading(true);
    const response = await api.getChannelSubscribers(channel.id);
    if (response.success && response.data) {
      setSubscribers(response.data);
    }
    setIsLoading(false);
  };

  const handleRemove = async (subscriberId: number) => {
    const subscriber = subscribers.find(s => s.id === subscriberId);
    if (!subscriber) return;
    setConfirmRemove({ show: true, subscriber });
  };

  const confirmRemoval = () => {
    if (confirmRemove.subscriber) {
      onRemoveSubscriber(confirmRemove.subscriber.id);
      setSubscribers(prev => prev.filter(s => s.id !== confirmRemove.subscriber!.id));
    }
    setConfirmRemove({ show: false, subscriber: null });
  };

  const cancelRemoval = () => {
    setConfirmRemove({ show: false, subscriber: null });
  };

  return (
    <>
      {confirmRemove.show && confirmRemove.subscriber && (
        <ConfirmModal
          title="Remove Subscriber"
          message={`Are you sure you want to remove ${confirmRemove.subscriber.name} from this channel?`}
          confirmText="Remove"
          cancelText="Cancel"
          onConfirm={confirmRemoval}
          onCancel={cancelRemoval}
          theme={theme}
        />
      )}

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 60 }}>
        <div className="rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto p-6" style={{
          backgroundColor: theme.id === 'midnight' ? '#2C2C2E' : '#FFFFFF'
        }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: theme.text }}>Subscribers</h2>
              <p className="text-sm text-gray-500 mt-1">{channel.name}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-6 h-6" style={{ color: theme.text }} />
            </button>
          </div>

        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 text-gray-400 animate-spin" />
            <p className="text-gray-500">Loading subscribers...</p>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No subscribers yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subscribers.map(subscriber => (
              <div key={subscriber.id} className="flex items-center gap-3 p-3 rounded-lg border" style={{
                borderColor: theme.accent,
                backgroundColor: theme.id === 'midnight' ? '#1C1C1E' : theme.background
              }}>
                <Avatar user={subscriber} size="md" theme={theme} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate" style={{ color: theme.text }}>
                      {subscriber.name}
                    </span>
                    {subscriber.verified && (
                      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill={theme.primary}>
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">@{subscriber.username}</p>
                  {subscriber.subscribedAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Subscribed {new Date(subscriber.subscribedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(subscriber.id)}
                  className="px-3 py-1.5 text-sm rounded-lg border transition-colors hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                  style={{
                    borderColor: theme.accent,
                    color: theme.text
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </>
  );
};
