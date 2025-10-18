import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../test/utils';
import { StoryComponent } from './StoryComponent';
import { mockUser, mockStory, mockTheme } from '../test/utils';

describe('StoryComponent', () => {
  const mockOnLike = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnUpdate = vi.fn();
  const mockOnComment = vi.fn();
  const mockOnViewProfile = vi.fn();
  const mockOnViewPost = vi.fn();

  const defaultProps = {
    story: mockStory,
    user: mockUser,
    onLike: mockOnLike,
    onDelete: mockOnDelete,
    onUpdate: mockOnUpdate,
    onComment: mockOnComment,
    onViewProfile: mockOnViewProfile,
    onViewStory: mockOnViewPost,
    currentUserId: 1,
    isHydrated: false,
    theme: mockTheme,
    allStories: [mockStory],
  };

  it('should render post content', () => {
    render(<StoryComponent {...defaultProps} />);

    expect(screen.getByText(mockStory.content)).toBeInTheDocument();
  });

  it('should render user information', () => {
    render(<StoryComponent {...defaultProps} />);

    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    expect(screen.getByText(`@${mockUser.username}`)).toBeInTheDocument();
  });

  it('should render like and comment counts', () => {
    render(<StoryComponent {...defaultProps} />);

    expect(screen.getByText(mockStory.likes.toString())).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // Comment count
  });

  it('should call onLike when like button is clicked', async () => {
    const user = userEvent.setup();
    render(<StoryComponent {...defaultProps} />);

    // Find button containing the like count
    const likeButton = screen.getByText(mockStory.likes.toString()).closest('button');
    expect(likeButton).toBeTruthy();

    await user.click(likeButton!);

    expect(mockOnLike).toHaveBeenCalledWith(mockStory.id);
  });

  it('should call onViewProfile when clicking user name', async () => {
    const user = userEvent.setup();
    render(<StoryComponent {...defaultProps} />);

    const nameButton = screen.getByText(mockUser.name);
    await user.click(nameButton);

    expect(mockOnViewProfile).toHaveBeenCalledWith(mockUser.id);
  });

  it('should call onViewProfile when clicking username', async () => {
    const user = userEvent.setup();
    render(<StoryComponent {...defaultProps} />);

    const usernameButton = screen.getByText(`@${mockUser.username}`);
    await user.click(usernameButton);

    expect(mockOnViewProfile).toHaveBeenCalledWith(mockUser.id);
  });

  it('should show comment input when expandComments is true', () => {
    render(<StoryComponent {...defaultProps} expandComments={true} />);

    expect(screen.getByPlaceholderText('Write a comment...')).toBeInTheDocument();
  });

  it('should call onComment when submitting a comment', async () => {
    const user = userEvent.setup();
    render(<StoryComponent {...defaultProps} expandComments={true} />);

    // Type comment
    const input = screen.getByPlaceholderText('Write a comment...');
    await user.type(input, 'Test comment');

    // Submit
    const postButton = screen.getByRole('button', { name: /post/i });
    await user.click(postButton);

    expect(mockOnComment).toHaveBeenCalledWith(mockStory.id, 'Test comment');
  });

  it('should not call onComment when comment is empty', () => {
    render(<StoryComponent {...defaultProps} expandComments={true} />);

    // Post button should be disabled when input is empty
    const postButton = screen.getByRole('button', { name: /post/i });
    expect(postButton).toBeDisabled();
  });

  it('should show edit menu for post owner', () => {
    render(<StoryComponent {...defaultProps} currentUserId={mockStory.userId} />);

    // For owner, there should be additional interactive buttons beyond the standard ones
    const buttons = screen.getAllByRole('button');
    // Owner should have more buttons (like, comment, share, AND menu button)
    expect(buttons.length).toBeGreaterThan(5);
  });

  it('should not show edit menu for non-owner', () => {
    render(<StoryComponent {...defaultProps} currentUserId={999} />);

    // For non-owner, should have fewer buttons (no menu button)
    const buttons = screen.getAllByRole('button');
    // Should have standard buttons (like, comment, share, profile buttons) but no menu
    expect(buttons.length).toBeLessThan(10);
  });

  it('should display hydrated styling', () => {
    const { container } = render(
      <StoryComponent {...defaultProps} isHydrated={true} />
    );

    const story = container.querySelector('.shadow-md');
    expect(story).toBeInTheDocument();
  });

  it('should render child stories (comments)', () => {
    const commentPost = {
      ...mockStory,
      id: 2,
      parentId: mockStory.id,
      content: 'This is a comment',
    };

    render(
      <StoryComponent {...defaultProps} allStories={[mockStory, commentPost]} />
    );

    // Should show 1 comment count
    const buttons = screen.getAllByRole('button');
    const commentButton = buttons.find(btn => btn.textContent?.includes('1'));
    expect(commentButton).toBeTruthy();
    expect(commentButton?.textContent).toContain('1');
  });

  it('should call onViewStory when clicking timestamp', async () => {
    const user = userEvent.setup();
    render(<StoryComponent {...defaultProps} />);

    const timestampButton = screen.getByText(mockStory.timestamp);
    await user.click(timestampButton);

    expect(mockOnViewPost).toHaveBeenCalledWith(mockStory.id);
  });

  it('should expand comments by default when expandComments is true', () => {
    const commentPost = {
      ...mockStory,
      id: 2,
      parentId: mockStory.id,
      content: 'This is a comment',
    };

    render(
      <StoryComponent
        {...defaultProps}
        allStories={[mockStory, commentPost]}
        expandComments={true}
      />
    );

    // Comment input should be visible immediately
    expect(screen.getByPlaceholderText('Write a comment...')).toBeInTheDocument();
  });

  it('should not expand comments by default when expandComments is false', () => {
    const commentPost = {
      ...mockStory,
      id: 2,
      parentId: mockStory.id,
      content: 'This is a comment',
    };

    render(
      <StoryComponent
        {...defaultProps}
        allStories={[mockStory, commentPost]}
        expandComments={false}
      />
    );

    // Comment input should not be visible
    expect(screen.queryByPlaceholderText('Write a comment...')).not.toBeInTheDocument();
  });

  it('should use false as default for expandComments when not specified', () => {
    const commentPost = {
      ...mockStory,
      id: 2,
      parentId: mockStory.id,
      content: 'This is a comment',
    };

    render(
      <StoryComponent {...defaultProps} allStories={[mockStory, commentPost]} />
    );

    // Comment input should not be visible (default is false)
    expect(screen.queryByPlaceholderText('Write a comment...')).not.toBeInTheDocument();
  });

  it('should pass onViewStory to Comment components', async () => {
    const user = userEvent.setup();
    const commentPost = {
      ...mockStory,
      id: 2,
      parentId: mockStory.id,
      content: 'This is a comment',
      timestamp: '3m ago',
    };

    render(
      <StoryComponent
        {...defaultProps}
        allStories={[mockStory, commentPost]}
        expandComments={true}
      />
    );

    // Click on comment timestamp
    const commentTimestamp = screen.getByText('3m ago');
    await user.click(commentTimestamp);

    expect(mockOnViewPost).toHaveBeenCalledWith(commentPost.id);
  });
});
