import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../test/utils';
import { ThemeSelector } from './ThemeSelector';
import { themes } from '../types';

describe('ThemeSelector', () => {
  const mockOnThemeChange = vi.fn();
  const mockOnClose = vi.fn();

  const defaultProps = {
    currentTheme: themes[0],
    onThemeChange: mockOnThemeChange,
    onClose: mockOnClose,
  };

  it('should render all available themes', () => {
    render(<ThemeSelector {...defaultProps} />);

    themes.forEach(theme => {
      expect(screen.getByText(theme.name)).toBeInTheDocument();
    });
  });

  it('should call onThemeChange when a theme is selected', async () => {
    const user = userEvent.setup();
    render(<ThemeSelector {...defaultProps} />);

    const oceanTheme = screen.getByText('Ocean Blue');
    await user.click(oceanTheme);

    expect(mockOnThemeChange).toHaveBeenCalledWith(themes[1]);
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<ThemeSelector {...defaultProps} />);

    // Find all buttons - the close button should be at the top
    const buttons = screen.getAllByRole('button');
    // First button should be the close button (X icon)
    await user.click(buttons[0]);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should highlight the current theme', () => {
    render(<ThemeSelector {...defaultProps} />);

    // The current theme button should exist
    const currentThemeButton = screen.getByText(themes[0].name).closest('button');
    expect(currentThemeButton).toBeInTheDocument();
    // The current theme should have higher border opacity
    expect(currentThemeButton).toHaveClass('border-opacity-100');
  });

  it('should display theme colors preview', () => {
    render(<ThemeSelector {...defaultProps} />);

    themes.forEach(theme => {
      const themeButton = screen.getByText(theme.name).closest('button');
      expect(themeButton).toBeInTheDocument();
    });
  });

  it('should have a backdrop overlay', () => {
    const { container } = render(<ThemeSelector {...defaultProps} />);

    // Check that the backdrop overlay exists
    const backdrop = container.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
    expect(backdrop).toBeTruthy();
  });
});
