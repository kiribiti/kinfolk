import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Theme, User } from '../types';
import { ApiService } from '../api';

interface LoginModalProps {
  theme: Theme;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  theme,
  onClose,
  onLoginSuccess,
  showNotification
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    name: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    setIsLoggingIn(true);

    try {
      const response = await ApiService.login(formData.email, formData.password);

      if (response.success && response.data) {
        showNotification('Login successful!', 'success');
        onLoginSuccess(response.data.user);
        onClose();
      } else {
        showNotification(response.error || 'Login failed', 'error');
      }
    } catch (error) {
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerData.username.trim() || !registerData.email.trim() ||
        !registerData.password.trim() || !registerData.name.trim()) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    setIsLoggingIn(true);

    try {
      const response = await ApiService.register(
        registerData.username,
        registerData.email,
        registerData.password,
        registerData.name
      );

      if (response.success && response.data) {
        showNotification('Registration successful!', 'success');
        onLoginSuccess(response.data.user);
        onClose();
      } else {
        showNotification(response.error || 'Registration failed', 'error');
      }
    } catch (error) {
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="rounded-lg max-w-md w-full p-6" style={{
        backgroundColor: theme.id === 'midnight' ? '#2C2C2E' : '#FFFFFF'
      }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: theme.text }}>
            {showRegister ? 'Create Account' : 'Login'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{
              ':hover': {
                backgroundColor: theme.id === 'midnight' ? '#3C3C3E' : '#F3F4F6'
              }
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.id === 'midnight' ? '#3C3C3E' : '#F3F4F6'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X className="w-6 h-6" style={{ color: theme.text }} />
          </button>
        </div>

        {!showRegister ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  borderColor: theme.accent,
                  backgroundColor: theme.id === 'midnight' ? '#1C1C1E' : '#FFFFFF',
                  color: theme.text
                }}
                disabled={isLoggingIn}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  borderColor: theme.accent,
                  backgroundColor: theme.id === 'midnight' ? '#1C1C1E' : '#FFFFFF',
                  color: theme.text
                }}
                disabled={isLoggingIn}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoggingIn || !formData.email.trim() || !formData.password.trim()}
                className="w-full px-6 py-2 text-white rounded-lg transition-colors disabled:bg-gray-300"
                style={{
                  backgroundColor: isLoggingIn || !formData.email.trim() || !formData.password.trim()
                    ? undefined
                    : theme.primary
                }}
              >
                {isLoggingIn ? 'Logging in...' : 'Login'}
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setShowRegister(true)}
                className="text-sm transition-colors"
                style={{ color: theme.primary }}
                disabled={isLoggingIn}
              >
                Don't have an account? Register
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                Username
              </label>
              <input
                type="text"
                value={registerData.username}
                onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                placeholder="Choose a username"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  borderColor: theme.accent,
                  backgroundColor: theme.id === 'midnight' ? '#1C1C1E' : '#FFFFFF',
                  color: theme.text
                }}
                disabled={isLoggingIn}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                Name
              </label>
              <input
                type="text"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                placeholder="Your full name"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  borderColor: theme.accent,
                  backgroundColor: theme.id === 'midnight' ? '#1C1C1E' : '#FFFFFF',
                  color: theme.text
                }}
                disabled={isLoggingIn}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                Email
              </label>
              <input
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                placeholder="your@email.com"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  borderColor: theme.accent,
                  backgroundColor: theme.id === 'midnight' ? '#1C1C1E' : '#FFFFFF',
                  color: theme.text
                }}
                disabled={isLoggingIn}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                Password
              </label>
              <input
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                placeholder="Choose a password"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  borderColor: theme.accent,
                  backgroundColor: theme.id === 'midnight' ? '#1C1C1E' : '#FFFFFF',
                  color: theme.text
                }}
                disabled={isLoggingIn}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoggingIn || !registerData.username.trim() || !registerData.email.trim() ||
                         !registerData.password.trim() || !registerData.name.trim()}
                className="w-full px-6 py-2 text-white rounded-lg transition-colors disabled:bg-gray-300"
                style={{
                  backgroundColor: isLoggingIn || !registerData.username.trim() || !registerData.email.trim() ||
                                   !registerData.password.trim() || !registerData.name.trim()
                    ? undefined
                    : theme.primary
                }}
              >
                {isLoggingIn ? 'Creating account...' : 'Create Account'}
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setShowRegister(false)}
                className="text-sm transition-colors"
                style={{ color: theme.primary }}
                disabled={isLoggingIn}
              >
                Already have an account? Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
