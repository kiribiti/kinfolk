import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/utils';
import { Avatar } from './Avatar';
import { mockUser, mockVerifiedUser, mockTheme } from '../test/utils';

describe('Avatar', () => {
  it('should render avatar with default size', () => {
    render(<Avatar user={mockUser} theme={mockTheme} />);

    const avatar = screen.getByText(mockUser.avatar);
    expect(avatar).toBeInTheDocument();
  });

  it('should render avatar with small size', () => {
    const { container } = render(
      <Avatar user={mockUser} theme={mockTheme} size="sm" />
    );

    const avatar = container.querySelector('.w-8.h-8');
    expect(avatar).toBeInTheDocument();
  });

  it('should render avatar with medium size', () => {
    const { container } = render(
      <Avatar user={mockUser} theme={mockTheme} size="md" />
    );

    const avatar = container.querySelector('.w-10.h-10');
    expect(avatar).toBeInTheDocument();
  });

  it('should render avatar with large size', () => {
    const { container } = render(
      <Avatar user={mockUser} theme={mockTheme} size="lg" />
    );

    const avatar = container.querySelector('.w-12.h-12');
    expect(avatar).toBeInTheDocument();
  });

  it('should apply gradient background using theme colors', () => {
    const { container } = render(
      <Avatar user={mockUser} theme={mockTheme} />
    );

    const avatar = container.firstChild as HTMLElement;
    const backgroundStyle = avatar.style.background;

    expect(backgroundStyle).toContain(mockTheme.primary);
    expect(backgroundStyle).toContain(mockTheme.secondary);
  });

  it('should render different user avatars', () => {
    const { rerender } = render(<Avatar user={mockUser} theme={mockTheme} />);
    expect(screen.getByText(mockUser.avatar)).toBeInTheDocument();

    rerender(<Avatar user={mockVerifiedUser} theme={mockTheme} />);
    expect(screen.getByText(mockVerifiedUser.avatar)).toBeInTheDocument();
  });
});
