import { describe, it, expect, beforeEach } from 'vitest';
import { formatTimestamp, initializeDB, channelsDB, storiesDB, mockUsers } from './mockData';

describe('formatTimestamp', () => {
  it('should return "Just now" for very recent dates', () => {
    const now = new Date();
    expect(formatTimestamp(now)).toBe('Just now');
  });

  it('should return minutes ago for recent dates', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatTimestamp(fiveMinutesAgo)).toBe('5m ago');
  });

  it('should return hours ago for dates within 24 hours', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(formatTimestamp(threeHoursAgo)).toBe('3h ago');
  });

  it('should return days ago for dates within a week', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(formatTimestamp(threeDaysAgo)).toBe('3d ago');
  });

  it('should return formatted date for older dates', () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const result = formatTimestamp(tenDaysAgo);
    expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
  });
});

describe('initializeDB', () => {
  beforeEach(() => {
    // Clear databases
    channelsDB.length = 0;
    storiesDB.length = 0;
    // Note: nextStoryId and nextChannelId are reset inside initializeDB
  });

  it('should create channels for all users', () => {
    initializeDB();

    expect(channelsDB.length).toBeGreaterThan(0);

    // Each user should have at least one channel
    mockUsers.forEach(user => {
      const userChannels = channelsDB.filter(c => c.userId === user.id);
      expect(userChannels.length).toBeGreaterThan(0);
    });
  });

  it('should create primary channel for each user', () => {
    initializeDB();

    mockUsers.forEach(user => {
      const primaryChannel = channelsDB.find(
        c => c.userId === user.id && c.isPrimary
      );
      expect(primaryChannel).toBeDefined();
      expect(primaryChannel?.name).toBe(user.name);
    });
  });

  it('should create initial stories', () => {
    initializeDB();

    expect(storiesDB.length).toBeGreaterThan(0);
  });

  it('should create stories with proper structure', () => {
    initializeDB();

    const story = storiesDB[0];
    expect(story).toHaveProperty('id');
    expect(story).toHaveProperty('userId');
    expect(story).toHaveProperty('channelId');
    expect(story).toHaveProperty('content');
    expect(story).toHaveProperty('timestamp');
    expect(story).toHaveProperty('likes');
    expect(story).toHaveProperty('comments');
    expect(story).toHaveProperty('likedBy');
  });

  it('should create comments with parentId', () => {
    initializeDB();

    // Filter for stories that have a parentId (comments)
    const comments = storiesDB.filter(p => p.parentId !== undefined && p.parentId !== null);

    // We should have mock comments and nested replies
    expect(comments.length).toBeGreaterThan(0);

    // Verify each comment has a valid parent
    comments.forEach(comment => {
      const parent = storiesDB.find(p => p.id === comment.parentId);
      expect(parent).toBeDefined();
      expect(parent?.id).toBe(comment.parentId);
    });
  });

  it('should create additional channels for specific users', () => {
    initializeDB();

    // Sarah should have an Archive Stories channel
    const sarahArchive = channelsDB.find(
      c => c.userId === 1 && c.name === 'Archive Stories'
    );
    expect(sarahArchive).toBeDefined();
    expect(sarahArchive?.isPrimary).toBe(false);

    // Maya should have an AI Ethics Research channel
    const mayaResearch = channelsDB.find(
      c => c.userId === 3 && c.name === 'AI Ethics Research'
    );
    expect(mayaResearch).toBeDefined();
    expect(mayaResearch?.isPrivate).toBe(true);
  });
});
