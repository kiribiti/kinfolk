/**
 * localStorage utility functions for Kinfolk
 * Handles persistent storage of user preferences
 */

const THEME_KEY = 'kinfolk-user-theme';

/**
 * Save theme ID to localStorage
 * @param themeId - The ID of the theme to save
 */
export const saveThemeToLocalStorage = (themeId: string): void => {
  try {
    localStorage.setItem(THEME_KEY, themeId);
  } catch (error) {
    console.warn('Failed to save theme to localStorage:', error);
  }
};

/**
 * Load theme ID from localStorage
 * @returns The saved theme ID, or null if not found
 */
export const loadThemeFromLocalStorage = (): string | null => {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch (error) {
    console.warn('Failed to load theme from localStorage:', error);
    return null;
  }
};

/**
 * Clear theme from localStorage
 */
export const clearThemeFromLocalStorage = (): void => {
  try {
    localStorage.removeItem(THEME_KEY);
  } catch (error) {
    console.warn('Failed to clear theme from localStorage:', error);
  }
};
