import React from 'react';
import { X, Check } from 'lucide-react';
import { Theme, themes } from '../types';

interface ThemeSelectorProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  onClose: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onThemeChange, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" style={{
        backgroundColor: currentTheme.id === 'midnight' ? '#2C2C2E' : '#FFFFFF'
      }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ color: currentTheme.text }}>Choose Your Theme</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = currentTheme.id === 'midnight' ? '#3C3C3E' : '#F3F4F6'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X className="w-6 h-6" style={{ color: currentTheme.text }} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {themes.map(theme => (
            <button
              key={theme.id}
              onClick={() => {
                onThemeChange(theme);
                onClose();
              }}
              className={`p-4 rounded-lg border-2 transition-all hover:shadow-lg ${
                currentTheme.id === theme.id ? 'border-opacity-100' : 'border-opacity-20'
              }`}
              style={{
                borderColor: theme.primary,
                backgroundColor: theme.background,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg" style={{ color: theme.text }}>
                  {theme.name}
                </h3>
                {currentTheme.id === theme.id && (
                  <Check className="w-5 h-5" style={{ color: theme.primary }} />
                )}
              </div>

              <div className="flex gap-2 mb-3">
                <div className="w-8 h-8 rounded-full" style={{ backgroundColor: theme.primary }}></div>
                <div className="w-8 h-8 rounded-full" style={{ backgroundColor: theme.secondary }}></div>
                <div className="w-8 h-8 rounded-full border" style={{ backgroundColor: theme.accent, borderColor: theme.primary }}></div>
              </div>

              <div className="text-left text-sm rounded p-2" style={{
                backgroundColor: theme.id === 'midnight' ? '#1C1C1E' : '#ffffff',
                color: theme.text,
                borderLeft: `4px solid ${theme.primary}`
              }}>
                Preview text in {theme.name}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
