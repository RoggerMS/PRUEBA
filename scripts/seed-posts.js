import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const samplePosts = [
  {
    content: "¡Hola a todos! 👋 Bienvenidos a nuestra nueva plataforma social estudiantil. Aquí podrán compartir conocimientos, hacer preguntas y conectar con otros estudiantes. #bienvenida #estudiantes",
    type: "TEXT",
    tags: "bienvenida,estudiantes",
    visibility: "PUBLIC"
  },
  {
    content: "¿Alguien tiene apuntes de Cálculo I? Especialmente sobre límites y derivadas. Estoy preparando mi examen final 📚 #calculo #matematicas #ayuda",
    type: "QUESTION",
    tags: "calculo,matematicas,ayuda",
    visibility: "PUBLIC"
  },
  {
    content: "Acabo de terminar mi proyecto de programación en React! 🚀 Ha sido un desafío increíble pero muy gratificante. Si alguien quiere ver el código, está en mi GitHub. #react #programacion #proyecto",
    type: "TEXT",
    tags: "react,programacion,proyecto",
    visibility: "PUBLIC"
  },
  {
    content: "Tips para estudiar mejor: \n1. Usa la técnica Pomodoro ⏰\n2. Encuentra tu lugar ideal de estudio 📖\n3. Elimina distracciones 📱\n4. Toma descansos regulares ☕\n\n¿Cuáles son sus técnicas favoritas? #estudio #tips #productividad",
    type: "TEXT",
    tags: "estudio,tips,productividad",
    visibility: "PUBLIC"
  },
  {
    content: "¡Increíble conferencia sobre Inteligencia Artificial hoy! 🤖 Los avances en machine learning son fascinantes. ¿Alguien más está interesado en este campo? #ia #machinelearning #tecnologia",
    type: "TEXT",
    tags: "ia,machinelearning,tecnologia",
    visibility: "PUBLIC"
  }
];

async function seedPosts() {
  try {
    console.log('🌱 Iniciando seed de publicaciones...');
    
    // Buscar el primer usuario disponible
    const user = await prisma.user.findFirst({
      where: {
        status: 'ACTIVE'
      }
    });
    
    if (!user) {
      console.log('❌ No se encontró ningún usuario activo. Creando usuario de ejemplo...');
      
      // Crear un usuario de ejemplo
      const newUser = await prisma.user.create({
        data: {
          email: 'demo@example.com',
          name: 'Usuario Demo',
          username: 'demo_user',
          firstName: 'Usuario',
          lastName: 'Demo',
          bio: 'Usuario de demostración para publicaciones de ejemplo',
          role: 'STUDENT',
          status: 'ACTIVE',
          verified: true
        }
      });
      
      console.log('✅ Usuario demo creado:', newUser.name);
      
      // Usar el nuevo usuario para las publicaciones
      for (const postData of samplePosts) {
        const post = await prisma.post.create({
          data: {
            ...postData,
            authorId: newUser.id
          }
        });
        console.log(`✅ Publicación creada: ${post.content.substring(0, 50)}...`);
      }
    } else {
      console.log('✅ Usuario encontrado:', user.name);
      
      // Verificar si ya existen publicaciones
      const existingPosts = await prisma.post.count();
      
      if (existingPosts > 0) {
        console.log(`ℹ️  Ya existen ${existingPosts} publicaciones en la base de datos.`);
        console.log('¿Deseas continuar agregando más publicaciones? (Continuando...)\n');
      }
      
      // Crear las publicaciones de ejemplo
      for (const postData of samplePosts) {
        const post = await prisma.post.create({
          data: {
            ...postData,
            authorId: user.id
          }
        });
        console.log(`✅ Publicación creada: ${post.content.substring(0, 50)}...`);
      }
    }
    
    console.log('\n🎉 Seed completado exitosamente!');
    console.log(`📊 Total de publicaciones en la base de datos: ${await prisma.post.count()}`);
    
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPosts();