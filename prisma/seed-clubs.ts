import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedClubs() {
  console.log('🌱 Seeding clubs data...');

  try {

    // Crear un usuario de ejemplo para ser presidente de los clubes
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@example.com' },
      update: {},
      create: {
        id: 'demo_user_1',
        email: 'demo@example.com',
        username: 'demo_user',
        name: 'Usuario Demo',
        firstName: 'Usuario',
        lastName: 'Demo',
        university: 'Universidad Mayor de San Andrés',
        career: 'Ingeniería de Sistemas',
        semester: 6
      }
    });

    console.log('✅ Demo user created:', demoUser.name);

    // Insertar clubes
    const clubs = await Promise.all([
      prisma.club.upsert({
        where: { id: 'club_1' },
        update: {},
        create: {
          id: 'club_1',
          name: 'Desarrolladores JavaScript',
          description: 'Club para aprender y compartir conocimientos sobre JavaScript, React, Node.js y tecnologías web modernas.',
          category: 'Tecnología',
          tags: 'javascript,react,nodejs,web,programación',
          isPrivate: false,
          memberCount: 1
        }
      }),
      prisma.club.upsert({
        where: { id: 'club_2' },
        update: {},
        create: {
          id: 'club_2',
          name: 'IA y Machine Learning',
          description: 'Exploramos el fascinante mundo de la inteligencia artificial y el aprendizaje automático.',
          category: 'Tecnología',
          tags: 'ia,machine learning,python,data science',
          isPrivate: false,
          memberCount: 1
        }
      }),
      prisma.club.upsert({
        where: { id: 'club_3' },
        update: {},
        create: {
          id: 'club_3',
          name: 'Fútbol Universitario',
          description: 'Club oficial de fútbol de la universidad. Entrenamientos regulares y competencias.',
          category: 'Deportes',
          tags: 'fútbol,deporte,competencia,entrenamiento',
          isPrivate: false,
          memberCount: 1
        }
      }),
      prisma.club.upsert({
        where: { id: 'club_4' },
        update: {},
        create: {
          id: 'club_4',
          name: 'Arte Digital',
          description: 'Creamos arte usando herramientas digitales, desde ilustración hasta animación 3D.',
          category: 'Arte y Cultura',
          tags: 'arte digital,diseño,ilustración,3d',
          isPrivate: false,
          memberCount: 1
        }
      }),
      prisma.club.upsert({
        where: { id: 'club_5' },
        update: {},
        create: {
          id: 'club_5',
          name: 'Física Cuántica',
          description: 'Estudiamos los misterios de la mecánica cuántica y sus aplicaciones.',
          category: 'Ciencias',
          tags: 'física,cuántica,ciencia,investigación',
          isPrivate: true,
          memberCount: 1
        }
      }),
      prisma.club.upsert({
        where: { id: 'club_6' },
        update: {},
        create: {
          id: 'club_6',
          name: 'English Conversation',
          description: 'Practica tu inglés en un ambiente relajado y divertido.',
          category: 'Idiomas',
          tags: 'inglés,conversación,idiomas,práctica',
          isPrivate: false,
          memberCount: 1
        }
      }),
      prisma.club.upsert({
        where: { id: 'club_7' },
        update: {},
        create: {
          id: 'club_7',
          name: 'Programación Competitiva',
          description: 'Preparación para concursos de programación y algoritmos.',
          category: 'Tecnología',
          tags: 'programación,algoritmos,competencia,concursos',
          isPrivate: false,
          memberCount: 1
        }
      }),
      prisma.club.upsert({
        where: { id: 'club_8' },
        update: {},
        create: {
          id: 'club_8',
          name: 'Banda Universitaria',
          description: 'La banda oficial de la universidad. Tocamos en eventos y ceremonias.',
          category: 'Arte y Cultura',
          tags: 'música,banda,instrumentos,eventos',
          isPrivate: false,
          memberCount: 1
        }
      })
    ]);

    console.log('✅ Clubs created:', clubs.length);

    // Agregar el usuario demo como administrador de algunos clubes
    const memberships = await Promise.all([
      prisma.clubMember.upsert({
        where: {
          userId_clubId: {
            userId: demoUser.id,
            clubId: 'club_1'
          }
        },
        update: {},
        create: {
          userId: demoUser.id,
          clubId: 'club_1',
          role: 'ADMIN'
        }
      }),
      prisma.clubMember.upsert({
        where: {
          userId_clubId: {
            userId: demoUser.id,
            clubId: 'club_2'
          }
        },
        update: {},
        create: {
          userId: demoUser.id,
          clubId: 'club_2',
          role: 'ADMIN'
        }
      }),
      prisma.clubMember.upsert({
        where: {
          userId_clubId: {
            userId: demoUser.id,
            clubId: 'club_3'
          }
        },
        update: {},
        create: {
          userId: demoUser.id,
          clubId: 'club_3',
          role: 'MODERATOR'
        }
      }),
      prisma.clubMember.upsert({
        where: {
          userId_clubId: {
            userId: demoUser.id,
            clubId: 'club_4'
          }
        },
        update: {},
        create: {
          userId: demoUser.id,
          clubId: 'club_4',
          role: 'MEMBER'
        }
      })
    ]);

    console.log('✅ Club memberships created:', memberships.length);

    // Insertar algunos posts de ejemplo
    const posts = await Promise.all([
      prisma.clubPost.upsert({
        where: { id: 'post_1' },
        update: {},
        create: {
          id: 'post_1',
          content: '¡Bienvenidos al Club de JavaScript! Hola a todos! Estamos emocionados de tener este espacio para compartir conocimientos sobre JavaScript. Próximamente organizaremos talleres sobre React y Node.js.',
          authorId: demoUser.id,
          clubId: 'club_1'
        }
      }),
      prisma.clubPost.upsert({
        where: { id: 'post_2' },
        update: {},
        create: {
          id: 'post_2',
          content: 'Taller de Machine Learning - Próximo Viernes. El próximo viernes tendremos un taller introductorio sobre redes neuronales. Traigan sus laptops!',
          authorId: demoUser.id,
          clubId: 'club_2'
        }
      }),
      prisma.clubPost.upsert({
        where: { id: 'post_3' },
        update: {},
        create: {
          id: 'post_3',
          content: 'Entrenamiento de Fútbol - Martes y Jueves. Recordatorio: entrenamientos los martes y jueves a las 4:00 PM en el campo principal.',
          authorId: demoUser.id,
          clubId: 'club_3'
        }
      })
    ]);

    console.log('✅ Club posts created:', posts.length);

    // Insertar algunos eventos de ejemplo
    const events = await Promise.all([
      prisma.event.upsert({
        where: { id: 'event_1' },
        update: {},
        create: {
          id: 'event_1',
          title: 'Hackathon JavaScript 2024',
          description: 'Hackathon de 24 horas para crear aplicaciones web innovadoras usando JavaScript.',
          startDate: new Date('2024-02-15T09:00:00Z'),
          endDate: new Date('2024-02-16T09:00:00Z'),
          location: 'Auditorio Principal',
          category: 'Tecnología',
          tags: 'hackathon,javascript,programación',
          maxAttendees: 100,
          clubId: 'club_1'
        }
      }),
      prisma.event.upsert({
        where: { id: 'event_2' },
        update: {},
        create: {
          id: 'event_2',
          title: 'Conferencia de IA',
          description: 'Conferencia sobre los últimos avances en inteligencia artificial.',
          startDate: new Date('2024-02-20T14:00:00Z'),
          endDate: new Date('2024-02-20T18:00:00Z'),
          location: 'Sala de Conferencias',
          category: 'Tecnología',
          tags: 'ia,conferencia,machine learning',
          maxAttendees: 50,
          clubId: 'club_2'
        }
      }),
      prisma.event.upsert({
        where: { id: 'event_3' },
        update: {},
        create: {
          id: 'event_3',
          title: 'Torneo de Fútbol Inter-Clubes',
          description: 'Torneo amistoso entre diferentes clubes deportivos.',
          startDate: new Date('2024-02-25T10:00:00Z'),
          endDate: new Date('2024-02-25T16:00:00Z'),
          location: 'Campo de Fútbol',
          category: 'Deportes',
          tags: 'fútbol,torneo,competencia',
          maxAttendees: 200,
          clubId: 'club_3'
        }
      }),
      prisma.event.upsert({
        where: { id: 'event_4' },
        update: {},
        create: {
          id: 'event_4',
          title: 'Exposición de Arte Digital',
          description: 'Muestra de los mejores trabajos creados por los miembros del club.',
          startDate: new Date('2024-03-01T10:00:00Z'),
          endDate: new Date('2024-03-01T20:00:00Z'),
          location: 'Galería de Arte',
          category: 'Arte y Cultura',
          tags: 'arte,exposición,digital',
          maxAttendees: 80,
          clubId: 'club_4'
        }
      })
    ]);

    console.log('✅ Club events created:', events.length);

    console.log('🎉 Clubs data seeding completed successfully!');
    console.log(`
📊 Summary:
- Demo User: ${demoUser.name}
- Clubs: ${clubs.length}
- Memberships: ${memberships.length}
- Posts: ${posts.length}
- Events: ${events.length}
`);

  } catch (error) {
    console.error('❌ Error seeding clubs data:', error);
    throw error;
  }
}

if (require.main === module) {
  seedClubs()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seedClubs };