import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.js';
import { registerSchema, loginSchema } from '../types/validation.js';

export const register = async (req: Request, res: Response) => {
  try {
    // Validate input
    const data = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { username: data.username },
        ],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: existingUser.email === data.email
          ? 'Email already registered'
          : 'Username already taken',
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash,
        name: data.name,
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      },
    });

    // Create primary channel for user
    await prisma.channel.create({
      data: {
        userId: user.id,
        platformId: 1,
        name: user.name,
        description: `${user.name}'s primary channel`,
        isPrimary: true,
        isPrivate: false,
      },
    });

    // Generate JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          verified: user.verified,
        },
        token,
      },
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error instanceof Error) {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    // Validate input
    const data = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Check password
    const validPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Generate JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          verified: user.verified,
          themeId: user.themeId,
          bio: user.bio,
          location: user.location,
          website: user.website,
          joinedDate: user.joinedDate,
        },
        token,
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof Error) {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
};
