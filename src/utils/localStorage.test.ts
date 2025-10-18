import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveThemeToLocalStorage, loadThemeFromLocalStorage, clearThemeFromLocalStorage } from './localStorage';

describe('localStorage utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('saveThemeToLocalStorage', () => {
    it('should save theme ID to localStorage', () => {
      saveThemeToLocalStorage('ocean');

      expect(localStorage.getItem('kinfolk-user-theme')).toBe('ocean');
    });

    it('should overwrite existing theme', () => {
      saveThemeToLocalStorage('ocean');
      saveThemeToLocalStorage('forest');

      expect(localStorage.getItem('kinfolk-user-theme')).toBe('forest');
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage is full');
      });

      saveThemeToLocalStorage('ocean');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to save theme to localStorage:',
        expect.any(Error)
      );

      consoleWarnSpy.mockRestore();
      setItemSpy.mockRestore();
    });
  });

  describe('loadThemeFromLocalStorage', () => {
    it('should load theme ID from localStorage', () => {
      localStorage.setItem('kinfolk-user-theme', 'ocean');

      const themeId = loadThemeFromLocalStorage();

      expect(themeId).toBe('ocean');
    });

    it('should return null when no theme is saved', () => {
      const themeId = loadThemeFromLocalStorage();

      expect(themeId).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage is not available');
      });

      const themeId = loadThemeFromLocalStorage();

      expect(themeId).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to load theme from localStorage:',
        expect.any(Error)
      );

      consoleWarnSpy.mockRestore();
      getItemSpy.mockRestore();
    });
  });

  describe('clearThemeFromLocalStorage', () => {
    it('should remove theme from localStorage', () => {
      localStorage.setItem('kinfolk-user-theme', 'ocean');

      clearThemeFromLocalStorage();

      expect(localStorage.getItem('kinfolk-user-theme')).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('localStorage is not available');
      });

      clearThemeFromLocalStorage();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to clear theme from localStorage:',
        expect.any(Error)
      );

      consoleWarnSpy.mockRestore();
      removeItemSpy.mockRestore();
    });
  });

  describe('theme persistence workflow', () => {
    it('should save and load theme successfully', () => {
      saveThemeToLocalStorage('lavender');
      const loadedTheme = loadThemeFromLocalStorage();

      expect(loadedTheme).toBe('lavender');
    });

    it('should handle clear and reload', () => {
      saveThemeToLocalStorage('coral');
      clearThemeFromLocalStorage();
      const loadedTheme = loadThemeFromLocalStorage();

      expect(loadedTheme).toBeNull();
    });
  });
});
