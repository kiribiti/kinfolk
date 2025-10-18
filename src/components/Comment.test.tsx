import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../test/utils';
import { Comment } from './Comment';
import { mockUser, mockStory, mockTheme, mockUsers } from '../test/utils';

describe('Comment', () => {
  const mockOnComment = vi.fn();
  const mockOnViewProfile = vi.fn();
  const mockOnViewPost = vi.fn();

  const baseComment = {
    ...mockStory,
    id: 10,
    parentId: 1,
    content: 'This is a test comment',
  };

  const defaultProps = {
    comment: baseComment,
    allStories: [baseComment],
    theme: mockTheme,
    onComment: mockOnComment,
    onViewProfile: mockOnViewProfile,
    onViewStory: mockOnViewPost,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render comment content', () => {
    render(<Comment {...defaultProps} />);
    expect(screen.getByText('This is a test comment')).toBeInTheDocument();
  });

  it('should render comment user information', () => {
    render(<Comment {...defaultProps} />);
    // Comment component looks up user from mockUsers array
    const commentUser = mockUsers.find(u => u.id === baseComment.userId) || mockUsers[0];
    expect(screen.getByText(commentUser.name)).toBeInTheDocument();
    expect(screen.getByText(`@${commentUser.username}`)).toBeInTheDocument();
  });

  it('should render comment timestamp', () => {
    render(<Comment {...defaultProps} />);
    expect(screen.getByText(baseComment.timestamp)).toBeInTheDocument();
  });

  it('should call onViewProfile when clicking user name', async () => {
    const user = userEvent.setup();
    render(<Comment {...defaultProps} />);

    const commentUser = mockUsers.find(u => u.id === baseComment.userId) || mockUsers[0];
    const nameButton = screen.getByText(commentUser.name);
    await user.click(nameButton);

    expect(mockOnViewProfile).toHaveBeenCalledWith(commentUser.id);
  });

  it('should call onViewProfile when clicking username', async () => {
    const user = userEvent.setup();
    render(<Comment {...defaultProps} />);

    const commentUser = mockUsers.find(u => u.id === baseComment.userId) || mockUsers[0];
    const usernameButton = screen.getByText(`@${commentUser.username}`);
    await user.click(usernameButton);

    expect(mockOnViewProfile).toHaveBeenCalledWith(commentUser.id);
  });

  it('should call onViewStory when clicking timestamp', async () => {
    const user = userEvent.setup();
    render(<Comment {...defaultProps} />);

    const timestampButton = screen.getByText(baseComment.timestamp);
    await user.click(timestampButton);

    expect(mockOnViewPost).toHaveBeenCalledWith(baseComment.id);
  });

  it('should show reply button', () => {
    render(<Comment {...defaultProps} />);
    expect(screen.getByRole('button', { name: /reply/i })).toBeInTheDocument();
  });

  it('should toggle reply input when reply button is clicked', async () => {
    const user = userEvent.setup();
    render(<Comment {...defaultProps} />);

    const replyButton = screen.getByRole('button', { name: /reply/i });
    await user.click(replyButton);

    expect(screen.getByPlaceholderText('Write a reply...')).toBeInTheDocument();
  });

  it('should call onComment when submitting a reply', async () => {
    const user = userEvent.setup();
    render(<Comment {...defaultProps} />);

    // Open reply input
    const replyButtons = screen.getAllByRole('button', { name: /reply/i });
    await user.click(replyButtons[0]);

    // Type reply
    const input = screen.getByPlaceholderText('Write a reply...');
    await user.type(input, 'Test reply');

    // Submit - find the submit button which should be in the DOM now
    const submitButtons = screen.getAllByRole('button', { name: /reply/i });
    // The last one should be the submit button
    const submitButton = submitButtons[submitButtons.length - 1];
    await user.click(submitButton);

    expect(mockOnComment).toHaveBeenCalledWith(baseComment.id, 'Test reply');
  });

  it('should clear reply input after submission', async () => {
    const user = userEvent.setup();
    render(<Comment {...defaultProps} />);

    // Open reply input
    const replyButtons = screen.getAllByRole('button', { name: /reply/i });
    await user.click(replyButtons[0]);

    // Type and submit reply
    const input = screen.getByPlaceholderText('Write a reply...');
    await user.type(input, 'Test reply');
    const submitButtons = screen.getAllByRole('button', { name: /reply/i });
    const submitButton = submitButtons[submitButtons.length - 1];
    await user.click(submitButton);

    // Input should be hidden after submission
    expect(screen.queryByPlaceholderText('Write a reply...')).not.toBeInTheDocument();
  });

  it('should not submit empty reply', async () => {
    const user = userEvent.setup();
    render(<Comment {...defaultProps} />);

    // Open reply input
    const replyButtons = screen.getAllByRole('button', { name: /reply/i });
    await user.click(replyButtons[0]);

    // Try to submit without typing - the submit button should be disabled
    const submitButtons = screen.getAllByRole('button', { name: /reply/i });
    const submitButton = submitButtons[submitButtons.length - 1];
    expect(submitButton).toBeDisabled();
  });

  it('should display nested replies', () => {
    const reply1 = {
      ...mockStory,
      id: 11,
      parentId: baseComment.id,
      content: 'First nested reply',
      userId: 2,
    };

    const reply2 = {
      ...mockStory,
      id: 12,
      parentId: baseComment.id,
      content: 'Second nested reply',
      userId: 3,
    };

    render(<Comment {...defaultProps} allStories={[baseComment, reply1, reply2]} />);

    expect(screen.getByText('First nested reply')).toBeInTheDocument();
    expect(screen.getByText('Second nested reply')).toBeInTheDocument();
  });

  it('should show reply count when there are nested replies', () => {
    const reply1 = {
      ...mockStory,
      id: 11,
      parentId: baseComment.id,
      content: 'First nested reply',
    };

    const reply2 = {
      ...mockStory,
      id: 12,
      parentId: baseComment.id,
      content: 'Second nested reply',
    };

    render(<Comment {...defaultProps} allStories={[baseComment, reply1, reply2]} />);

    expect(screen.getByText(/reply \(2\)/i)).toBeInTheDocument();
  });

  it('should call onViewStory for nested reply timestamps', async () => {
    const user = userEvent.setup();
    const reply1 = {
      ...mockStory,
      id: 11,
      parentId: baseComment.id,
      content: 'Nested reply',
      timestamp: '3m ago',
    };

    render(<Comment {...defaultProps} allStories={[baseComment, reply1]} />);

    const nestedTimestamp = screen.getByText('3m ago');
    await user.click(nestedTimestamp);

    expect(mockOnViewPost).toHaveBeenCalledWith(reply1.id);
  });

  it('should submit reply on Enter key press', async () => {
    const user = userEvent.setup();
    render(<Comment {...defaultProps} />);

    // Open reply input
    const replyButton = screen.getByRole('button', { name: /reply/i });
    await user.click(replyButton);

    // Type reply and press Enter
    const input = screen.getByPlaceholderText('Write a reply...');
    await user.type(input, 'Test reply{Enter}');

    expect(mockOnComment).toHaveBeenCalledWith(baseComment.id, 'Test reply');
  });

  it('should not submit on Shift+Enter', async () => {
    const user = userEvent.setup();
    render(<Comment {...defaultProps} />);

    // Open reply input
    const replyButton = screen.getByRole('button', { name: /reply/i });
    await user.click(replyButton);

    // Type reply and press Shift+Enter
    const input = screen.getByPlaceholderText('Write a reply...');
    await user.type(input, 'Test reply');
    await user.keyboard('{Shift>}{Enter}{/Shift}');

    // Should not submit
    expect(mockOnComment).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText('Write a reply...')).toBeInTheDocument();
  });
});
