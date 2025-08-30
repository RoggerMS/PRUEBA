import { PrismaClient, Visibility } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create demo users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@local.test' },
    update: {},
    create: {
      email: 'admin@local.test',
      username: 'admin',
      name: 'Admin User',
      bio: 'Administrator of the platform',
      university: 'Tech University',
      career: 'Computer Science',
      password: await bcrypt.hash('admin123', 12),
      emailVerified: new Date(),
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@local.test' },
    update: {},
    create: {
      email: 'demo@local.test',
      username: 'demo',
      name: 'Demo User',
      bio: 'Demo user for testing purposes',
      university: 'Demo University',
      career: 'Software Engineering',
      password: await bcrypt.hash('demo123', 12),
      emailVerified: new Date(),
    },
  });

  const johnUser = await prisma.user.upsert({
    where: { email: 'john@local.test' },
    update: {},
    create: {
      email: 'john@local.test',
      username: 'john',
      name: 'John Doe',
      bio: 'Software developer and tech enthusiast',
      university: 'State University',
      career: 'Information Technology',
      password: await bcrypt.hash('john123', 12),
      emailVerified: new Date(),
    },
  });

  console.log('✅ Users created:', { adminUser: adminUser.username, demoUser: demoUser.username, johnUser: johnUser.username });

  // Create posts with different visibility levels
  const publicPosts = [
    {
      content: 'Welcome to our platform! This is a public post that everyone can see. 🌟',
      visibility: Visibility.PUBLIC,
      authorId: adminUser.id,
    },
    {
      content: 'Just finished working on a new feature. Excited to share it with everyone! 🚀',
      visibility: Visibility.PUBLIC,
      authorId: demoUser.id,
    },
    {
      content: 'Learning React and loving it! Any tips for a beginner? #ReactJS #WebDev',
      visibility: Visibility.PUBLIC,
      authorId: johnUser.id,
    },
    {
      content: 'Beautiful sunset today! Sometimes you need to take a break and enjoy nature 🌅',
      visibility: Visibility.PUBLIC,
      authorId: adminUser.id,
    },
  ];

  const followersPosts = [
    {
      content: 'This post is only visible to my followers. Working on something special! 👥',
      visibility: Visibility.FOLLOWERS,
      authorId: adminUser.id,
    },
    {
      content: 'Followers only: Here\'s a sneak peek of the new design I\'m working on 🎨',
      visibility: Visibility.FOLLOWERS,
      authorId: demoUser.id,
    },
    {
      content: 'For my followers: Just got accepted to a new internship! So excited! 🎉',
      visibility: Visibility.FOLLOWERS,
      authorId: johnUser.id,
    },
  ];

  const privatePosts = [
    {
      content: 'This is a private post. Only I can see this. Personal thoughts and notes 📝',
      visibility: Visibility.PRIVATE,
      authorId: adminUser.id,
    },
    {
      content: 'Private note: Remember to review the authentication system tomorrow',
      visibility: Visibility.PRIVATE,
      authorId: demoUser.id,
    },
    {
      content: 'Personal reminder: Call mom this weekend ❤️',
      visibility: Visibility.PRIVATE,
      authorId: johnUser.id,
    },
  ];

  // Insert all posts
  const allPosts = [...publicPosts, ...followersPosts, ...privatePosts];
  
  for (const postData of allPosts) {
    await prisma.post.create({
      data: postData,
    });
  }

  console.log('✅ Posts created:');
  console.log(`   - ${publicPosts.length} PUBLIC posts`);
  console.log(`   - ${followersPosts.length} FOLLOWERS posts`);
  console.log(`   - ${privatePosts.length} PRIVATE posts`);

  // Create some sample follows (for testing followers visibility)
  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: demoUser.id,
        followingId: adminUser.id,
      },
    },
    update: {},
    create: {
      followerId: demoUser.id,
      followingId: adminUser.id,
    },
  });

  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: johnUser.id,
        followingId: adminUser.id,
      },
    },
    update: {},
    create: {
      followerId: johnUser.id,
      followingId: adminUser.id,
    },
  });

  console.log('✅ Follow relationships created');
  console.log('🌱 Database seeding completed successfully!');
  console.log('');
  console.log('Demo accounts created:');
  console.log('  - admin@local.test / admin123');
  console.log('  - demo@local.test / demo123');
  console.log('  - john@local.test / john123');
  console.log('');
  console.log('Post visibility distribution:');
  console.log(`  - PUBLIC: ${publicPosts.length} posts (visible to everyone)`);
  console.log(`  - FOLLOWERS: ${followersPosts.length} posts (visible to followers only)`);
  console.log(`  - PRIVATE: ${privatePosts.length} posts (visible to author only)`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });