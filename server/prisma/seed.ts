import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clear existing data
  await prisma.like.deleteMany();
  await prisma.media.deleteMany();
  await prisma.story.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data');

  // Hash password for all users (password: "password")
  const passwordHash = await bcrypt.hash('password', 10);

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: 'sarahchen',
        email: 'sarah@example.com',
        passwordHash,
        name: 'Sarah Chen',
        avatar: '👩‍💻',
        verified: true,
        bio: 'Software engineer building the future. Passionate about open source and clean code.',
        location: 'San Francisco, CA',
        website: 'sarahchen.dev',
        joinedDate: 'January 2023',
      },
    }),
    prisma.user.create({
      data: {
        username: 'alexr',
        email: 'alex@example.com',
        passwordHash,
        name: 'Alex Rivera',
        avatar: '👨‍🎨',
        verified: false,
        bio: 'Designer & creative technologist',
        location: 'Brooklyn, NY',
        themeId: 'ocean',
      },
    }),
    prisma.user.create({
      data: {
        username: 'mayap',
        email: 'maya@example.com',
        passwordHash,
        name: 'Maya Patel',
        avatar: '👩‍🔬',
        verified: true,
        bio: 'Research scientist exploring AI ethics',
        location: 'London, UK',
        themeId: 'forest',
      },
    }),
    prisma.user.create({
      data: {
        username: 'jordanl',
        email: 'jordan@example.com',
        passwordHash,
        name: 'Jordan Lee',
        avatar: '👨‍💼',
        verified: false,
        bio: 'Product manager at tech startup',
        themeId: 'sunset',
      },
    }),
    prisma.user.create({
      data: {
        username: 'samtay',
        email: 'sam@example.com',
        passwordHash,
        name: 'Sam Taylor',
        avatar: '👩‍🚀',
        verified: true,
        bio: 'Space enthusiast & aerospace engineer',
        location: 'Houston, TX',
        website: 'samtaylor.space',
        themeId: 'midnight',
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // Create channels for each user
  const channels = await Promise.all([
    // Sarah's channels
    prisma.channel.create({
      data: {
        userId: users[0].id,
        platformId: 1,
        name: 'Sarah Chen',
        description: "Sarah Chen's primary channel",
        isPrimary: true,
        isPrivate: false,
        subscriberCount: 1234,
        storyCount: 0,
      },
    }),
    prisma.channel.create({
      data: {
        userId: users[0].id,
        platformId: 1,
        name: 'Archive Stories',
        description: 'Historical projects and research',
        isPrimary: false,
        isPrivate: false,
        subscriberCount: 234,
        storyCount: 0,
      },
    }),
    // Alex's channel
    prisma.channel.create({
      data: {
        userId: users[1].id,
        platformId: 1,
        name: 'Alex Rivera',
        description: "Alex Rivera's primary channel",
        isPrimary: true,
        isPrivate: false,
        subscriberCount: 892,
        storyCount: 0,
      },
    }),
    // Maya's channels
    prisma.channel.create({
      data: {
        userId: users[2].id,
        platformId: 1,
        name: 'Maya Patel',
        description: "Maya Patel's primary channel",
        isPrimary: true,
        isPrivate: false,
        subscriberCount: 2341,
        storyCount: 0,
      },
    }),
    prisma.channel.create({
      data: {
        userId: users[2].id,
        platformId: 1,
        name: 'AI Ethics Research',
        description: 'In-depth research papers and findings',
        isPrimary: false,
        isPrivate: true,
        subscriberCount: 89,
        storyCount: 0,
      },
    }),
    // Jordan's channel
    prisma.channel.create({
      data: {
        userId: users[3].id,
        platformId: 1,
        name: 'Jordan Lee',
        description: "Jordan Lee's primary channel",
        isPrimary: true,
        isPrivate: false,
        subscriberCount: 456,
        storyCount: 0,
      },
    }),
    // Sam's channel
    prisma.channel.create({
      data: {
        userId: users[4].id,
        platformId: 1,
        name: 'Sam Taylor',
        description: "Sam Taylor's primary channel",
        isPrimary: true,
        isPrivate: false,
        subscriberCount: 3456,
        storyCount: 0,
      },
    }),
  ]);

  console.log(`Created ${channels.length} channels`);

  // Create initial stories
  const now = new Date();
  const stories = await Promise.all([
    prisma.story.create({
      data: {
        userId: users[0].id,
        channelId: channels[0].id,
        content: 'Just shipped a new feature that reduces API response time by 40%! Sometimes the best optimizations come from questioning your assumptions. What\'s your recent win?',
        likes: Math.floor(Math.random() * 200),
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
    }),
    prisma.story.create({
      data: {
        userId: users[2].id,
        channelId: channels[3].id,
        content: 'Interesting observation: The best code reviews aren\'t about finding bugs—they\'re about sharing knowledge and building team culture. Changed my whole approach this year.',
        likes: Math.floor(Math.random() * 200),
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      },
    }),
    prisma.story.create({
      data: {
        userId: users[1].id,
        channelId: channels[2].id,
        content: 'Hot take: Design systems are overrated for small teams. You end up spending more time maintaining the system than actually building features. Thoughts?',
        likes: Math.floor(Math.random() * 200),
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      },
    }),
    prisma.story.create({
      data: {
        userId: users[4].id,
        channelId: channels[6].id,
        content: 'Deployed to production on a Friday afternoon. Living dangerously. 🚀',
        likes: Math.floor(Math.random() * 200),
        createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000),
      },
    }),
    prisma.story.create({
      data: {
        userId: users[3].id,
        channelId: channels[5].id,
        content: 'After 3 years of remote work, I finally understand why senior devs always said "just talk to your team." Async communication is great, but some problems need a 5-minute call.',
        likes: Math.floor(Math.random() * 200),
        createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      },
    }),
  ]);

  console.log(`Created ${stories.length} stories`);

  // Add some likes
  await Promise.all([
    prisma.like.create({ data: { userId: users[1].id, storyId: stories[0].id } }),
    prisma.like.create({ data: { userId: users[2].id, storyId: stories[0].id } }),
    prisma.like.create({ data: { userId: users[0].id, storyId: stories[1].id } }),
    prisma.like.create({ data: { userId: users[4].id, storyId: stories[2].id } }),
  ]);

  console.log('Created likes');

  // Create subscriptions
  await Promise.all([
    // Subscriptions to Sarah's primary channel
    prisma.subscription.create({
      data: {
        subscriberId: users[1].id,
        channelId: channels[0].id,
        status: 'active',
        approvedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.subscription.create({
      data: {
        subscriberId: users[2].id,
        channelId: channels[0].id,
        status: 'active',
        approvedAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  console.log('Created subscriptions');

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
