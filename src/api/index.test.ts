import { describe, it, expect, beforeEach } from 'vitest';
import { ApiService } from './index';
import { storiesDB } from '../data/mockData';

describe('ApiService', () => {
  beforeEach(() => {
    // Reset stories database before each test
    storiesDB.length = 0;
  });

  describe('createStory', () => {
    it('should create a story successfully', async () => {
      const response = await ApiService.createStory(
        1,
        'Test post content',
        undefined,
        1
      );

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.content).toBe('Test post content');
      expect(response.data?.userId).toBe(1);
      expect(response.data?.channelId).toBe(1);
    });

    it('should fail when content is empty', async () => {
      const response = await ApiService.createStory(1, '', undefined, 1);

      expect(response.success).toBe(false);
      expect(response.error).toBe('Story content cannot be empty');
    });

    it('should fail when content exceeds 500 characters', async () => {
      const longContent = 'a'.repeat(501);
      const response = await ApiService.createStory(1, longContent, undefined, 1);

      expect(response.success).toBe(false);
      expect(response.error).toBe('Story content must be 500 characters or less');
    });

    it('should fail when channel ID is not provided', async () => {
      const response = await ApiService.createStory(
        1,
        'Test content',
        undefined,
        undefined
      );

      expect(response.success).toBe(false);
      expect(response.error).toBe('Channel ID is required');
    });

    it('should create a comment with valid parentId', async () => {
      // First create a parent post
      const parentResponse = await ApiService.createStory(
        1,
        'Parent post',
        undefined,
        1
      );

      // Then create a comment
      const commentResponse = await ApiService.createStory(
        2,
        'Comment content',
        undefined,
        1,
        parentResponse.data!.id
      );

      expect(commentResponse.success).toBe(true);
      expect(commentResponse.data?.parentId).toBe(parentResponse.data!.id);
      expect(commentResponse.message).toBe('Comment created successfully');
    });

    it('should fail when creating comment with invalid parentId', async () => {
      const response = await ApiService.createStory(
        1,
        'Comment content',
        undefined,
        1,
        9999 // Non-existent parent
      );

      expect(response.success).toBe(false);
      expect(response.error).toBe('Parent story not found');
    });
  });

  describe('updateStory', () => {
    it('should update a story successfully', async () => {
      // Create a story first
      const createResponse = await ApiService.createStory(
        1,
        'Original content',
        undefined,
        1
      );

      // Update it
      const updateResponse = await ApiService.updateStory(
        createResponse.data!.id,
        'Updated content'
      );

      expect(updateResponse.success).toBe(true);
      expect(updateResponse.data?.content).toBe('Updated content');
      expect(updateResponse.message).toBe('Story updated successfully');
    });

    it('should fail when updating non-existent post', async () => {
      const response = await ApiService.updateStory(9999, 'New content');

      expect(response.success).toBe(false);
      expect(response.error).toBe('Story not found');
    });

    it('should fail when updated content exceeds 500 characters', async () => {
      const createResponse = await ApiService.createStory(
        1,
        'Original',
        undefined,
        1
      );

      const longContent = 'a'.repeat(501);
      const updateResponse = await ApiService.updateStory(
        createResponse.data!.id,
        longContent
      );

      expect(updateResponse.success).toBe(false);
      expect(updateResponse.error).toBe('Story content must be 500 characters or less');
    });
  });

  describe('deleteStory', () => {
    it('should delete a story successfully', async () => {
      // Create a story first
      const createResponse = await ApiService.createStory(
        1,
        'To be deleted',
        undefined,
        1
      );

      // Delete it
      const deleteResponse = await ApiService.deleteStory(
        createResponse.data!.id,
        1
      );

      expect(deleteResponse.success).toBe(true);
      expect(deleteResponse.message).toBe('Story deleted successfully');
    });

    it('should fail when deleting non-existent post', async () => {
      const response = await ApiService.deleteStory(9999, 1);

      expect(response.success).toBe(false);
      expect(response.error).toBe('Story not found');
    });

    it('should fail when user tries to delete another user\'s post', async () => {
      const createResponse = await ApiService.createStory(
        1,
        'User 1 post',
        undefined,
        1
      );

      const deleteResponse = await ApiService.deleteStory(
        createResponse.data!.id,
        2 // Different user
      );

      expect(deleteResponse.success).toBe(false);
      expect(deleteResponse.error).toBe('Unauthorized: You can only delete your own stories');
    });
  });

  describe('toggleLike', () => {
    it('should like a story', async () => {
      const createResponse = await ApiService.createStory(
        1,
        'Test post',
        undefined,
        1
      );

      const likeResponse = await ApiService.toggleLike(
        createResponse.data!.id,
        2
      );

      expect(likeResponse.success).toBe(true);
      expect(likeResponse.liked).toBe(true);
      expect(likeResponse.data?.likes).toBe(1);
      expect(likeResponse.data?.likedBy).toContain(2);
    });

    it('should unlike a story', async () => {
      const createResponse = await ApiService.createStory(
        1,
        'Test post',
        undefined,
        1
      );

      // Like it first
      await ApiService.toggleLike(createResponse.data!.id, 2);

      // Unlike it
      const unlikeResponse = await ApiService.toggleLike(
        createResponse.data!.id,
        2
      );

      expect(unlikeResponse.success).toBe(true);
      expect(unlikeResponse.liked).toBe(false);
      expect(unlikeResponse.data?.likes).toBe(0);
      expect(unlikeResponse.data?.likedBy).not.toContain(2);
    });

    it('should fail when liking non-existent post', async () => {
      const response = await ApiService.toggleLike(9999, 1);

      expect(response.success).toBe(false);
      expect(response.error).toBe('Story not found');
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const response = await ApiService.updateUserProfile(1, {
        name: 'Updated Name',
        bio: 'Updated bio',
      });

      expect(response.success).toBe(true);
      expect(response.data?.name).toBe('Updated Name');
      expect(response.data?.bio).toBe('Updated bio');
      expect(response.message).toBe('Profile updated successfully');
    });

    it('should fail when name is empty', async () => {
      const response = await ApiService.updateUserProfile(1, {
        name: '',
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('Name cannot be empty');
    });

    it('should fail when name exceeds 50 characters', async () => {
      const response = await ApiService.updateUserProfile(1, {
        name: 'a'.repeat(51),
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('Name must be 50 characters or less');
    });

    it('should fail when bio exceeds 200 characters', async () => {
      const response = await ApiService.updateUserProfile(1, {
        bio: 'a'.repeat(201),
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('Bio must be 200 characters or less');
    });

    it('should fail when updating non-existent user', async () => {
      const response = await ApiService.updateUserProfile(9999, {
        name: 'New Name',
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('User not found');
    });
  });
});
