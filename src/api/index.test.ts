import { describe, it, expect, beforeEach } from 'vitest';
import { ApiService } from './index';
import { postsDB } from '../data/mockData';

describe('ApiService', () => {
  beforeEach(() => {
    // Reset posts database before each test
    postsDB.length = 0;
  });

  describe('createPost', () => {
    it('should create a post successfully', async () => {
      const response = await ApiService.createPost(
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
      const response = await ApiService.createPost(1, '', undefined, 1);

      expect(response.success).toBe(false);
      expect(response.error).toBe('Post content cannot be empty');
    });

    it('should fail when content exceeds 500 characters', async () => {
      const longContent = 'a'.repeat(501);
      const response = await ApiService.createPost(1, longContent, undefined, 1);

      expect(response.success).toBe(false);
      expect(response.error).toBe('Post content must be 500 characters or less');
    });

    it('should fail when channel ID is not provided', async () => {
      const response = await ApiService.createPost(
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
      const parentResponse = await ApiService.createPost(
        1,
        'Parent post',
        undefined,
        1
      );

      // Then create a comment
      const commentResponse = await ApiService.createPost(
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
      const response = await ApiService.createPost(
        1,
        'Comment content',
        undefined,
        1,
        9999 // Non-existent parent
      );

      expect(response.success).toBe(false);
      expect(response.error).toBe('Parent post not found');
    });
  });

  describe('updatePost', () => {
    it('should update a post successfully', async () => {
      // Create a post first
      const createResponse = await ApiService.createPost(
        1,
        'Original content',
        undefined,
        1
      );

      // Update it
      const updateResponse = await ApiService.updatePost(
        createResponse.data!.id,
        'Updated content'
      );

      expect(updateResponse.success).toBe(true);
      expect(updateResponse.data?.content).toBe('Updated content');
      expect(updateResponse.message).toBe('Post updated successfully');
    });

    it('should fail when updating non-existent post', async () => {
      const response = await ApiService.updatePost(9999, 'New content');

      expect(response.success).toBe(false);
      expect(response.error).toBe('Post not found');
    });

    it('should fail when updated content exceeds 500 characters', async () => {
      const createResponse = await ApiService.createPost(
        1,
        'Original',
        undefined,
        1
      );

      const longContent = 'a'.repeat(501);
      const updateResponse = await ApiService.updatePost(
        createResponse.data!.id,
        longContent
      );

      expect(updateResponse.success).toBe(false);
      expect(updateResponse.error).toBe('Post content must be 500 characters or less');
    });
  });

  describe('deletePost', () => {
    it('should delete a post successfully', async () => {
      // Create a post first
      const createResponse = await ApiService.createPost(
        1,
        'To be deleted',
        undefined,
        1
      );

      // Delete it
      const deleteResponse = await ApiService.deletePost(
        createResponse.data!.id,
        1
      );

      expect(deleteResponse.success).toBe(true);
      expect(deleteResponse.message).toBe('Post deleted successfully');
    });

    it('should fail when deleting non-existent post', async () => {
      const response = await ApiService.deletePost(9999, 1);

      expect(response.success).toBe(false);
      expect(response.error).toBe('Post not found');
    });

    it('should fail when user tries to delete another user\'s post', async () => {
      const createResponse = await ApiService.createPost(
        1,
        'User 1 post',
        undefined,
        1
      );

      const deleteResponse = await ApiService.deletePost(
        createResponse.data!.id,
        2 // Different user
      );

      expect(deleteResponse.success).toBe(false);
      expect(deleteResponse.error).toBe('Unauthorized: You can only delete your own posts');
    });
  });

  describe('toggleLike', () => {
    it('should like a post', async () => {
      const createResponse = await ApiService.createPost(
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

    it('should unlike a post', async () => {
      const createResponse = await ApiService.createPost(
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
      expect(response.error).toBe('Post not found');
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
