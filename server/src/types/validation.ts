import { z } from 'zod';

// Auth schemas
export const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  name: z.string().min(1).max(50),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Story schemas
export const createStorySchema = z.object({
  content: z.string().min(1).max(500),
  channelId: z.number().int().positive(),
  parentId: z.number().int().positive().optional(),
  media: z.array(z.object({
    id: z.string(),
    type: z.enum(['image', 'video']),
    url: z.string(),
    thumbnail: z.string().optional(),
  })).max(4).optional(),
});

export const updateStorySchema = z.object({
  content: z.string().min(1).max(500),
});

// User schemas
export const updateUserSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  bio: z.string().max(200).optional(),
  location: z.string().max(100).optional(),
  website: z.string().max(100).optional(),
  themeId: z.string().optional(),
});

// Channel schemas
export const createChannelSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPrivate: z.boolean().default(false),
});

export const updateChannelSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isPrivate: z.boolean().optional(),
});

// Subscription schemas
export const subscribeSchema = z.object({
  channelId: z.number().int().positive(),
  requestMessage: z.string().max(200).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateStoryInput = z.infer<typeof createStorySchema>;
export type UpdateStoryInput = z.infer<typeof updateStorySchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateChannelInput = z.infer<typeof createChannelSchema>;
export type UpdateChannelInput = z.infer<typeof updateChannelSchema>;
export type SubscribeInput = z.infer<typeof subscribeSchema>;
