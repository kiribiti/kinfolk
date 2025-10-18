import React, { useState } from 'react';
import { X } from 'lucide-react';
import { User, Theme } from '../types';

interface EditProfileModalProps {
  user: User;
  theme: Theme;
  onClose: () => void;
  onSave: (updatedUser: Partial<User>) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  user,
  theme,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    bio: user.bio || '',
    location: user.location || '',
    website: user.website || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      return;
    }

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    onSave(formData);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto p-6" style={{
        backgroundColor: theme.id === 'midnight' ? '#2C2C2E' : '#FFFFFF'
      }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-bold" style={{ color: theme.text }}>Edit Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" style={{ color: theme.text }} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                borderColor: theme.accent,
                backgroundColor: theme.id === 'midnight' ? '#1C1C1E' : '#FFFFFF',
                color: theme.text
              }}
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself"
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none"
              style={{
                borderColor: theme.accent,
                backgroundColor: theme.id === 'midnight' ? '#1C1C1E' : '#FFFFFF',
                color: theme.text
              }}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/200</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Where are you based?"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                borderColor: theme.accent,
                backgroundColor: theme.id === 'midnight' ? '#1C1C1E' : '#FFFFFF',
                color: theme.text
              }}
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
              Website
            </label>
            <input
              type="text"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="yourwebsite.com"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                borderColor: theme.accent,
                backgroundColor: theme.id === 'midnight' ? '#1C1C1E' : '#FFFFFF',
                color: theme.text
              }}
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">Without https://</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg border transition-colors"
            style={{
              borderColor: theme.accent,
              color: theme.text,
              backgroundColor: theme.background
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !formData.name.trim()}
            className="px-6 py-2 text-white rounded-lg transition-colors disabled:bg-gray-300"
            style={{
              backgroundColor: isSaving || !formData.name.trim() ? undefined : theme.primary
            }}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
