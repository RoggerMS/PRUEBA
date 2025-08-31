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

  // Create sample notes
  const notes = [
    {
      title: 'Cálculo Diferencial - Límites',
      description: 'Apuntes completos sobre límites y continuidad',
      content: 'Los límites son fundamentales en cálculo. Un límite describe el comportamiento de una función cuando la variable independiente se acerca a un valor específico.',
      subject: 'MATEMATICAS',
      career: 'INGENIERIA',
      tags: 'calculo,limites,matematicas',
      visibility: 'PUBLIC',
      authorId: adminUser.id,
    },
    {
      title: 'Física I - Cinemática',
      description: 'Conceptos básicos de movimiento',
      content: 'La cinemática estudia el movimiento de los objetos sin considerar las causas que lo producen.',
      subject: 'FISICA',
      career: 'INGENIERIA',
      tags: 'fisica,cinematica,movimiento',
      visibility: 'PUBLIC',
      authorId: demoUser.id,
    },
    {
      title: 'Programación - Algoritmos',
      description: 'Estructuras de datos y algoritmos básicos',
      content: 'Un algoritmo es una secuencia finita de instrucciones bien definidas para resolver un problema.',
      subject: 'INFORMATICA',
      career: 'SISTEMAS',
      tags: 'programacion,algoritmos,estructuras',
      visibility: 'PRIVATE',
      authorId: johnUser.id,
    },
  ];

  const createdNotes = [];
  for (const noteData of notes) {
    const note = await prisma.note.create({
      data: noteData,
    });
    createdNotes.push(note);
  }

  console.log(`✅ ${createdNotes.length} Notes created`);

  // Create sample forum questions
  const questions = [
    {
      title: '¿Cómo resolver ecuaciones cuadráticas?',
      content: 'Necesito ayuda para entender el método de factorización y la fórmula cuadrática. Estoy trabajando con la ecuación x² - 5x + 6 = 0',
      subject: 'MATEMATICAS',
      career: 'INGENIERIA',
      tags: 'algebra,ecuaciones,matematicas',
      authorId: johnUser.id,
    },
    {
      title: '¿Cuál es la diferencia entre let, const y var en JavaScript?',
      content: 'Estoy aprendiendo JavaScript y me confunden las diferencias entre estas tres formas de declarar variables. ¿Podrían explicarme cuándo usar cada una?',
      subject: 'INFORMATICA',
      career: 'SISTEMAS',
      tags: 'javascript,variables,programacion',
      authorId: demoUser.id,
    },
    {
      title: 'Ayuda con las leyes de Newton',
      content: 'Tengo dificultades para aplicar las tres leyes de Newton en problemas de dinámica. ¿Alguien puede explicarme con ejemplos prácticos?',
      subject: 'FISICA',
      career: 'INGENIERIA',
      tags: 'fisica,newton,dinamica',
      authorId: adminUser.id,
    },
  ];

  const createdQuestions = [];
  for (const questionData of questions) {
    const question = await prisma.question.create({
      data: questionData,
    });
    createdQuestions.push(question);
  }

  console.log(`✅ ${createdQuestions.length} Forum questions created`);

  // Create sample answers
  const answers = [
    {
      content: 'Para resolver ecuaciones cuadráticas, puedes usar la factorización cuando es posible, o la fórmula cuadrática: x = (-b ± √(b² - 4ac)) / 2a. En tu ejemplo x² - 5x + 6 = 0, los factores son (x-2)(x-3) = 0, por lo que x = 2 o x = 3.',
      questionId: createdQuestions[0].id,
      authorId: adminUser.id,
    },
    {
      content: 'var tiene scope de función, let y const tienen scope de bloque. const no se puede reasignar, let sí. Usa const por defecto, let cuando necesites reasignar, y evita var en código moderno.',
      questionId: createdQuestions[1].id,
      authorId: johnUser.id,
    },
    {
      content: 'Las leyes de Newton son: 1) Un objeto en reposo permanece en reposo (inercia), 2) F = ma (fuerza = masa × aceleración), 3) A toda acción corresponde una reacción igual y opuesta.',
      questionId: createdQuestions[2].id,
      authorId: demoUser.id,
    },
  ];

  const createdAnswers = [];
  for (const answerData of answers) {
    const answer = await prisma.answer.create({
      data: answerData,
    });
    createdAnswers.push(answer);
  }

  console.log(`✅ ${createdAnswers.length} Forum answers created`);

  // Create some sample interactions (likes, comments, bookmarks, votes)
  const postIds = await prisma.post.findMany({ select: { id: true } });
  
  // Create likes
  const likes = [
    { postId: postIds[0].id, userId: demoUser.id },
    { postId: postIds[0].id, userId: johnUser.id },
    { postId: postIds[1].id, userId: adminUser.id },
    { postId: postIds[2].id, userId: adminUser.id },
  ];

  for (const likeData of likes) {
    await prisma.like.create({ data: likeData });
  }

  console.log(`✅ ${likes.length} Likes created`);

  // Create comments
  const comments = [
    {
      content: '¡Excelente post! Me parece muy útil esta información.',
      postId: postIds[0].id,
      authorId: demoUser.id,
    },
    {
      content: 'Gracias por compartir, me ayudó mucho.',
      postId: postIds[1].id,
      authorId: johnUser.id,
    },
    {
      content: '¿Podrías explicar más sobre este tema?',
      postId: postIds[2].id,
      authorId: adminUser.id,
    },
  ];

  const createdComments = [];
  for (const commentData of comments) {
    const comment = await prisma.comment.create({ data: commentData });
    createdComments.push(comment);
  }

  console.log(`✅ ${createdComments.length} Comments created`);

  // Create bookmarks
  const bookmarks = [
    { postId: postIds[0].id, userId: johnUser.id },
    { postId: postIds[1].id, userId: adminUser.id },
  ];

  for (const bookmarkData of bookmarks) {
    await prisma.bookmark.create({ data: bookmarkData });
  }

  console.log(`✅ ${bookmarks.length} Bookmarks created`);

  // Create votes for questions and answers
  const questionVotes = [
    { questionId: createdQuestions[0].id, userId: demoUser.id, type: 'UP' },
    { questionId: createdQuestions[0].id, userId: adminUser.id, type: 'UP' },
    { questionId: createdQuestions[1].id, userId: johnUser.id, type: 'UP' },
  ];

  for (const voteData of questionVotes) {
    await prisma.vote.create({ data: voteData });
  }

  const answerVotes = [
    { answerId: createdAnswers[0].id, userId: demoUser.id, type: 'UP' },
    { answerId: createdAnswers[0].id, userId: johnUser.id, type: 'UP' },
    { answerId: createdAnswers[1].id, userId: adminUser.id, type: 'UP' },
  ];

  for (const voteData of answerVotes) {
    await prisma.vote.create({ data: voteData });
  }

  console.log(`✅ ${questionVotes.length + answerVotes.length} Votes created`);

  console.log('🌱 Database seeding completed successfully!');
  console.log('');
  console.log('Demo accounts created:');
  console.log('  - admin@local.test / admin123');
  console.log('  - demo@local.test / demo123');
  console.log('  - john@local.test / john123');
  console.log('');
  console.log('Data created:');
  console.log(`  - Posts: ${publicPosts.length + followersPosts.length + privatePosts.length}`);
  console.log(`  - Notes: ${createdNotes.length}`);
  console.log(`  - Questions: ${createdQuestions.length}`);
  console.log(`  - Answers: ${createdAnswers.length}`);
  console.log(`  - Likes: ${likes.length}`);
  console.log(`  - Comments: ${createdComments.length}`);
  console.log(`  - Bookmarks: ${bookmarks.length}`);
  console.log(`  - Votes: ${questionVotes.length + answerVotes.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });