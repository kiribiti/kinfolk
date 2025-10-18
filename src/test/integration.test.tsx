import { describe, it, expect, beforeEach } from 'vitest';
import { ApiService } from '../api';
import { storiesDB, initializeDB, mockUsers } from '../data/mockData';

/**
 * Integration tests for end-to-end workflows
 * These tests verify that multiple components work together correctly
 */
describe('Integration Tests', () => {
  beforeEach(() => {
    storiesDB.length = 0;
    initializeDB();
  });

  describe('Story and Comment Workflow', () => {
    it('should create post, add comment, like both, then delete', async () => {
      // Create a story
      const postResponse = await ApiService.createStory(
        mockUsers[0].id,
        'Original post content',
        undefined,
        1
      );

      expect(postResponse.success).toBe(true);
      expect(postResponse.data).toBeDefined();

      const storyId = postResponse.data!.id;

      // Add a comment to the post
      const commentResponse = await ApiService.createStory(
        mockUsers[1].id,
        'This is a comment',
        undefined,
        1,
        storyId
      );

      expect(commentResponse.success).toBe(true);
      expect(commentResponse.data?.parentId).toBe(storyId);

      const commentId = commentResponse.data!.id;

      // Like the original post
      const likePostResponse = await ApiService.toggleLike(storyId, mockUsers[2].id);
      expect(likePostResponse.success).toBe(true);
      expect(likePostResponse.liked).toBe(true);
      expect(likePostResponse.data?.likes).toBe(1);

      // Like the comment
      const likeCommentResponse = await ApiService.toggleLike(commentId, mockUsers[2].id);
      expect(likeCommentResponse.success).toBe(true);
      expect(likeCommentResponse.liked).toBe(true);

      // Delete the comment
      const deleteCommentResponse = await ApiService.deleteStory(commentId, mockUsers[1].id);
      expect(deleteCommentResponse.success).toBe(true);

      // Verify comment is deleted
      const commentExists = storiesDB.find(p => p.id === commentId);
      expect(commentExists).toBeUndefined();

      // Original post should still exist
      const postExists = storiesDB.find(p => p.id === storyId);
      expect(postExists).toBeDefined();

      // Delete the original post
      const deleteStoryResponse = await ApiService.deleteStory(storyId, mockUsers[0].id);
      expect(deleteStoryResponse.success).toBe(true);
    });

    it('should handle comment thread with multiple replies', async () => {
      // Create parent post
      const parentResponse = await ApiService.createStory(
        mockUsers[0].id,
        'Discussion topic',
        undefined,
        1
      );

      const parentId = parentResponse.data!.id;

      // Create multiple comments
      const comment1 = await ApiService.createStory(
        mockUsers[1].id,
        'First comment',
        undefined,
        1,
        parentId
      );

      const comment2 = await ApiService.createStory(
        mockUsers[2].id,
        'Second comment',
        undefined,
        1,
        parentId
      );

      const comment3 = await ApiService.createStory(
        mockUsers[3].id,
        'Third comment',
        undefined,
        1,
        parentId
      );

      // Verify all comments have the same parentId
      expect(comment1.data?.parentId).toBe(parentId);
      expect(comment2.data?.parentId).toBe(parentId);
      expect(comment3.data?.parentId).toBe(parentId);

      // Count comments for the parent post
      const comments = storiesDB.filter(p => p.parentId === parentId);
      expect(comments.length).toBe(3);
    });

    it('should handle nested replies (replies to comments)', async () => {
      // Create parent post
      const postResponse = await ApiService.createStory(
        mockUsers[0].id,
        'Original post',
        undefined,
        1
      );

      const storyId = postResponse.data!.id;

      // Create a comment on the post
      const commentResponse = await ApiService.createStory(
        mockUsers[1].id,
        'First level comment',
        undefined,
        1,
        storyId
      );

      const commentId = commentResponse.data!.id;

      // Create replies to the comment
      const reply1 = await ApiService.createStory(
        mockUsers[2].id,
        'Reply to comment',
        undefined,
        1,
        commentId
      );

      const reply2 = await ApiService.createStory(
        mockUsers[3].id,
        'Another reply to comment',
        undefined,
        1,
        commentId
      );

      // Verify nested structure
      expect(commentResponse.data?.parentId).toBe(storyId);
      expect(reply1.data?.parentId).toBe(commentId);
      expect(reply2.data?.parentId).toBe(commentId);

      // Count direct comments to the post (should be 1)
      const directComments = storiesDB.filter(p => p.parentId === storyId);
      expect(directComments.length).toBe(1);

      // Count replies to the comment (should be 2)
      const nestedReplies = storiesDB.filter(p => p.parentId === commentId);
      expect(nestedReplies.length).toBe(2);
    });

    it('should handle deep nesting (3 levels)', async () => {
      // Create parent post
      const postResponse = await ApiService.createStory(
        mockUsers[0].id,
        'Original post',
        undefined,
        1
      );

      const storyId = postResponse.data!.id;

      // Level 1: Comment on post
      const comment = await ApiService.createStory(
        mockUsers[1].id,
        'Level 1 comment',
        undefined,
        1,
        storyId
      );

      const commentId = comment.data!.id;

      // Level 2: Reply to comment
      const reply = await ApiService.createStory(
        mockUsers[2].id,
        'Level 2 reply',
        undefined,
        1,
        commentId
      );

      const replyId = reply.data!.id;

      // Level 3: Reply to reply
      const nestedReply = await ApiService.createStory(
        mockUsers[3].id,
        'Level 3 nested reply',
        undefined,
        1,
        replyId
      );

      // Verify the chain
      expect(comment.data?.parentId).toBe(storyId);
      expect(reply.data?.parentId).toBe(commentId);
      expect(nestedReply.data?.parentId).toBe(replyId);

      // Each level should have exactly one child
      expect(storiesDB.filter(p => p.parentId === storyId).length).toBe(1);
      expect(storiesDB.filter(p => p.parentId === commentId).length).toBe(1);
      expect(storiesDB.filter(p => p.parentId === replyId).length).toBe(1);
    });

    it('should handle deleting comment with nested replies', async () => {
      // Create parent post
      const postResponse = await ApiService.createStory(
        mockUsers[0].id,
        'Original post',
        undefined,
        1
      );

      const storyId = postResponse.data!.id;

      // Create comment
      const commentResponse = await ApiService.createStory(
        mockUsers[1].id,
        'Comment',
        undefined,
        1,
        storyId
      );

      const commentId = commentResponse.data!.id;

      // Create replies to comment
      await ApiService.createStory(
        mockUsers[2].id,
        'Reply 1',
        undefined,
        1,
        commentId
      );

      await ApiService.createStory(
        mockUsers[3].id,
        'Reply 2',
        undefined,
        1,
        commentId
      );

      // Delete the comment (parent of nested replies)
      const deleteResponse = await ApiService.deleteStory(commentId, mockUsers[1].id);
      expect(deleteResponse.success).toBe(true);

      // Comment should be deleted
      expect(storiesDB.find(p => p.id === commentId)).toBeUndefined();

      // Note: In real implementation, you might want to cascade delete replies
      // or orphan them. This test just verifies the comment itself is deleted.
    });
  });

  describe('User Profile Workflow', () => {
    it('should update user profile and verify changes', async () => {
      const userId = mockUsers[0].id;

      // Update name and bio
      const updateResponse = await ApiService.updateUserProfile(userId, {
        name: 'New Name',
        bio: 'Updated biography',
        location: 'New City',
        website: 'newsite.com',
      });

      expect(updateResponse.success).toBe(true);
      expect(updateResponse.data?.name).toBe('New Name');
      expect(updateResponse.data?.bio).toBe('Updated biography');
      expect(updateResponse.data?.location).toBe('New City');
      expect(updateResponse.data?.website).toBe('newsite.com');

      // Partial update (only bio)
      const partialUpdate = await ApiService.updateUserProfile(userId, {
        bio: 'Just updating bio',
      });

      expect(partialUpdate.success).toBe(true);
      expect(partialUpdate.data?.bio).toBe('Just updating bio');
      expect(partialUpdate.data?.name).toBe('New Name'); // Should preserve previous update
    });
  });

  describe('Story Interactions Workflow', () => {
    it('should handle multiple users liking and unliking', async () => {
      // Create a story
      const postResponse = await ApiService.createStory(
        mockUsers[0].id,
        'Popular post',
        undefined,
        1
      );

      const storyId = postResponse.data!.id;

      // Multiple users like the post
      await ApiService.toggleLike(storyId, mockUsers[1].id);
      await ApiService.toggleLike(storyId, mockUsers[2].id);
      await ApiService.toggleLike(storyId, mockUsers[3].id);

      const story = storiesDB.find(p => p.id === storyId);
      expect(story?.likes).toBe(3);
      expect(story?.likedBy).toHaveLength(3);

      // One user unlikes
      await ApiService.toggleLike(storyId, mockUsers[1].id);

      const updatedPost = storiesDB.find(p => p.id === storyId);
      expect(updatedPost?.likes).toBe(2);
      expect(updatedPost?.likedBy).toHaveLength(2);
      expect(updatedPost?.likedBy).not.toContain(mockUsers[1].id);
    });

    it('should update post and maintain metadata', async () => {
      // Create a story
      const postResponse = await ApiService.createStory(
        mockUsers[0].id,
        'Original content',
        undefined,
        1
      );

      const storyId = postResponse.data!.id;

      // Like the post before updating
      await ApiService.toggleLike(storyId, mockUsers[1].id);

      // Update the post
      const updateResponse = await ApiService.updateStory(storyId, 'Updated content');

      expect(updateResponse.success).toBe(true);
      expect(updateResponse.data?.content).toBe('Updated content');

      // Verify likes are maintained
      expect(updateResponse.data?.likes).toBe(1);
      expect(updateResponse.data?.likedBy).toContain(mockUsers[1].id);
    });
  });

  describe('Authorization and Security', () => {
    it('should prevent unauthorized post deletion', async () => {
      const postResponse = await ApiService.createStory(
        mockUsers[0].id,
        'User 1 post',
        undefined,
        1
      );

      const storyId = postResponse.data!.id;

      // Try to delete with different user
      const deleteResponse = await ApiService.deleteStory(storyId, mockUsers[1].id);

      expect(deleteResponse.success).toBe(false);
      expect(deleteResponse.error).toBe('Unauthorized: You can only delete your own stories');

      // Verify post still exists
      const story = storiesDB.find(p => p.id === storyId);
      expect(story).toBeDefined();
    });

    it('should validate content length on create and update', async () => {
      const longContent = 'a'.repeat(501);

      // Create with long content
      const createResponse = await ApiService.createStory(
        mockUsers[0].id,
        longContent,
        undefined,
        1
      );

      expect(createResponse.success).toBe(false);
      expect(createResponse.error).toContain('500 characters');

      // Create valid post
      const validPost = await ApiService.createStory(
        mockUsers[0].id,
        'Valid content',
        undefined,
        1
      );

      // Try to update with long content
      const updateResponse = await ApiService.updateStory(
        validPost.data!.id,
        longContent
      );

      expect(updateResponse.success).toBe(false);
      expect(updateResponse.error).toContain('500 characters');
    });
  });
});
