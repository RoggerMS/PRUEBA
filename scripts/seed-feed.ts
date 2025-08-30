import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with feed data...');

  // Create test users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'maria.garcia@universidad.edu' },
      update: {},
      create: {
        email: 'maria.garcia@universidad.edu',
        name: 'María García',
        username: 'maria_garcia',
        password: await bcrypt.hash('password123', 10),
        university: 'Universidad Nacional',
        career: 'Medicina',
        location: 'Bogotá, Colombia',
        bio: 'Estudiante de medicina apasionada por la cardiología y la investigación.',
        verified: true,
        image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        xp: 1500,
        level: 5,
        showAchievements: true,
        showActivity: true,
        emailNotifications: true,
        pushNotifications: true,
        forumNotifications: true
      }
    }),
    prisma.user.upsert({
      where: { email: 'carlos.rodriguez@tech.edu' },
      update: {},
      create: {
        email: 'carlos.rodriguez@tech.edu',
        name: 'Carlos Rodríguez',
        username: 'carlos_dev',
        password: await bcrypt.hash('password123', 10),
        university: 'Instituto Tecnológico',
        career: 'Ingeniería de Sistemas',
        location: 'Medellín, Colombia',
        bio: 'Desarrollador full-stack y entusiasta de los algoritmos.',
        verified: false,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        xp: 1800,
        level: 6,
        showAchievements: true,
        showActivity: true,
        emailNotifications: true,
        pushNotifications: false,
        forumNotifications: true
      }
    }),
    prisma.user.upsert({
      where: { email: 'ana.martinez@psico.edu' },
      update: {},
      create: {
        email: 'ana.martinez@psico.edu',
        name: 'Ana Martínez',
        username: 'ana_neuro',
        password: await bcrypt.hash('password123', 10),
        university: 'Universidad de Psicología',
        career: 'Psicología',
        location: 'Cali, Colombia',
        bio: 'Investigadora en neuroplasticidad y psicología cognitiva.',
        verified: true,
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        xp: 2100,
        level: 7,
        showAchievements: true,
        showActivity: false,
        emailNotifications: false,
        pushNotifications: true,
        forumNotifications: true
      }
    })
  ]);

  console.log('✅ Users created:', users.length);

  // Create sample posts
  const posts = [
    {
      content: '¿Cuál es la diferencia entre un algoritmo de ordenamiento burbuja y quicksort? Estoy estudiando para mi examen de estructuras de datos y me gustaría entender mejor cuándo usar cada uno. ¿Alguien puede explicarme con ejemplos prácticos?',
      type: 'QUESTION',
      visibility: 'PUBLIC',
      tags: 'algoritmos,programacion,estructuras-datos,ordenamiento',
      authorId: users[1].id, // Carlos
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    },
    {
      content: 'Resumen completo sobre el sistema cardiovascular:\n\n🫀 **Anatomía del corazón:**\n- 4 cámaras: 2 aurículas y 2 ventrículos\n- Válvulas: tricúspide, pulmonar, mitral, aórtica\n\n🩸 **Circulación:**\n- Sistémica: corazón → cuerpo → corazón\n- Pulmonar: corazón → pulmones → corazón\n\n⚡ **Sistema de conducción:**\n- Nodo sinoauricular (marcapasos natural)\n- Nodo auriculoventricular\n- Haz de His y fibras de Purkinje\n\n📊 **Valores normales:**\n- FC: 60-100 lpm\n- PA: 120/80 mmHg\n- Gasto cardíaco: 5-6 L/min',
      type: 'TEXT',
      visibility: 'UNIVERSITY',
      tags: 'medicina,cardiologia,anatomia,fisiologia,apuntes',
      authorId: users[0].id, // María
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    },
    {
      content: 'Mi tesis sobre neuroplasticidad está tomando forma! 🧠✨\n\nDespués de 6 meses de investigación, he encontrado evidencia fascinante sobre cómo el cerebro se adapta después de lesiones. Los resultados preliminares muestran que:\n\n🔬 La plasticidad sináptica es más activa de lo que pensábamos\n📈 Los ejercicios cognitivos específicos pueden acelerar la recuperación\n🎯 La edad no es una barrera absoluta para la neuroplasticidad\n\nEstoy emocionada de presentar estos hallazgos en el congreso nacional. La neurociencia sigue sorprendiéndonos cada día.\n\n#Neuroplasticidad #Investigación #Tesis #Neurociencia',
      type: 'TEXT',
      visibility: 'PUBLIC',
      tags: 'neuroplasticidad,investigacion,tesis,neurociencia,psicologia',
      authorId: users[2].id, // Ana
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
    },
    {
      content: 'Implementé mi primer algoritmo de búsqueda binaria en Python! 🐍\n\n```python\ndef busqueda_binaria(arr, objetivo):\n    izquierda, derecha = 0, len(arr) - 1\n    \n    while izquierda <= derecha:\n        medio = (izquierda + derecha) // 2\n        \n        if arr[medio] == objetivo:\n            return medio\n        elif arr[medio] < objetivo:\n            izquierda = medio + 1\n        else:\n            derecha = medio - 1\n    \n    return -1\n```\n\nLa complejidad es O(log n), mucho mejor que la búsqueda lineal O(n). ¿Alguien tiene tips para optimizarlo aún más?',
      type: 'TEXT',
      visibility: 'PUBLIC',
      tags: 'python,algoritmos,busqueda-binaria,programacion,codigo',
      authorId: users[1].id, // Carlos
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
    },
    {
      content: '¿Qué técnicas de estudio han funcionado mejor para memorizar la anatomía? Tengo examen de anatomía patológica la próxima semana y necesito memorizar muchas estructuras. He probado flashcards pero se me olvida rápido.',
      type: 'QUESTION',
      visibility: 'UNIVERSITY',
      tags: 'anatomia,estudio,medicina,tecnicas,memoria',
      authorId: users[0].id, // María
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
    },
    {
      content: 'Reflexión del día: La mente humana es increíblemente resiliente. En mis estudios sobre trauma y recuperación, he visto cómo las personas pueden superar experiencias devastadoras y salir fortalecidas. La neuroplasticidad no solo se trata de recuperación física, sino también emocional y psicológica. Cada día aprendo algo nuevo sobre la capacidad humana de adaptación.',
      type: 'TEXT',
      visibility: 'PUBLIC',
      tags: 'psicologia,resilencia,trauma,recuperacion,reflexion',
      authorId: users[2].id, // Ana
      createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
    }
  ];

  const createdPosts = [];
  for (const postData of posts) {
    const post = await prisma.post.create({
      data: postData
    });
    createdPosts.push(post);
  }

  console.log('✅ Posts created:', createdPosts.length);

  // Create some reactions
  const reactions = [
    { postId: createdPosts[0].id, userId: users[0].id, type: 'FIRE' },
    { postId: createdPosts[0].id, userId: users[2].id, type: 'FIRE' },
    { postId: createdPosts[1].id, userId: users[1].id, type: 'FIRE' },
    { postId: createdPosts[1].id, userId: users[2].id, type: 'FIRE' },
    { postId: createdPosts[2].id, userId: users[0].id, type: 'FIRE' },
    { postId: createdPosts[2].id, userId: users[1].id, type: 'FIRE' },
    { postId: createdPosts[3].id, userId: users[0].id, type: 'FIRE' },
    { postId: createdPosts[4].id, userId: users[1].id, type: 'FIRE' },
    { postId: createdPosts[4].id, userId: users[2].id, type: 'FIRE' },
    { postId: createdPosts[5].id, userId: users[0].id, type: 'FIRE' },
  ];

  for (const reactionData of reactions) {
    await prisma.postReaction.create({
      data: reactionData
    });
  }

  console.log('✅ Reactions created:', reactions.length);

  // Create some comments
  const comments = [
    {
      content: 'Excelente pregunta! QuickSort es generalmente más eficiente con O(n log n) en promedio, mientras que burbuja es O(n²). Te recomiendo usar QuickSort para datasets grandes.',
      postId: createdPosts[0].id,
      authorId: users[0].id
    },
    {
      content: 'Muy buenos apuntes María! Me ayudaron mucho para repasar. ¿Podrías agregar algo sobre las arritmias más comunes?',
      postId: createdPosts[1].id,
      authorId: users[1].id
    },
    {
      content: '¡Felicidades Ana! Tu investigación suena fascinante. ¿Has considerado publicar en alguna revista científica?',
      postId: createdPosts[2].id,
      authorId: users[0].id
    },
    {
      content: 'Buen código Carlos! Una optimización sería usar búsqueda binaria interpolada para datos uniformemente distribuidos.',
      postId: createdPosts[3].id,
      authorId: users[2].id
    },
    {
      content: 'Te recomiendo usar mapas mentales y asociar cada estructura con una imagen visual. A mí me funcionó muy bien!',
      postId: createdPosts[4].id,
      authorId: users[2].id
    }
  ];

  for (const commentData of comments) {
    await prisma.comment.create({
      data: commentData
    });
  }

  console.log('✅ Comments created:', comments.length);

  // Create some bookmarks
  const bookmarks = [
    { postId: createdPosts[1].id, userId: users[1].id }, // Carlos saves María's notes
    { postId: createdPosts[2].id, userId: users[0].id }, // María saves Ana's research
    { postId: createdPosts[3].id, userId: users[0].id }, // María saves Carlos' code
    { postId: createdPosts[1].id, userId: users[2].id }, // Ana saves María's notes
  ];

  for (const bookmarkData of bookmarks) {
    await prisma.bookmark.create({
      data: bookmarkData
    });
  }

  console.log('✅ Bookmarks created:', bookmarks.length);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Users: ${users.length}`);
  console.log(`   Posts: ${createdPosts.length}`);
  console.log(`   Reactions: ${reactions.length}`);
  console.log(`   Comments: ${comments.length}`);
  console.log(`   Bookmarks: ${bookmarks.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });