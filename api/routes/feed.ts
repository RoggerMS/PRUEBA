import express, { type Request, type Response } from 'express';

const router = express.Router();

// Mock data for posts
const mockPosts = [
  {
    id: '1',
    type: 'question',
    title: '¿Cómo optimizar React para mejor rendimiento?',
    content: 'Estoy trabajando en una aplicación React y necesito consejos sobre optimización. ¿Cuáles son las mejores prácticas?',
    author: {
      id: 'user1',
      name: 'Ana García',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      verified: true
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    visibility: 'public',
    reactions: { fire: 15, count: 15 },
    comments: 8,
    saved: false,
    hashtags: ['react', 'performance', 'optimization']
  },
  {
    id: '2',
    type: 'note',
    title: 'Guía completa de TypeScript',
    content: 'TypeScript es un superset de JavaScript que añade tipado estático. Aquí tienes una guía completa para empezar:\n\n1. Instalación\n2. Configuración básica\n3. Tipos primitivos\n4. Interfaces y tipos\n5. Clases y herencia',
    author: {
      id: 'user2',
      name: 'Carlos Mendez',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      verified: false
    },
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    visibility: 'public',
    reactions: { fire: 23, count: 23 },
    comments: 12,
    saved: true,
    hashtags: ['typescript', 'javascript', 'programming']
  },
  {
    id: '3',
    type: 'photo',
    title: 'Mi setup de desarrollo',
    content: 'Aquí está mi espacio de trabajo después de la renovación. ¡Me encanta cómo quedó!',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=600&fit=crop',
        alt: 'Setup de desarrollo'
      }
    ],
    author: {
      id: 'user3',
      name: 'María López',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      verified: true
    },
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    visibility: 'public',
    reactions: { fire: 31, count: 31 },
    comments: 5,
    saved: false,
    hashtags: ['setup', 'workspace', 'productivity']
  },
  {
    id: '4',
    type: 'video',
    title: 'Tutorial: Animaciones con CSS',
    content: 'Un tutorial rápido sobre cómo crear animaciones suaves con CSS. ¡Perfecto para principiantes!',
    media: [
      {
        type: 'video',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop',
        alt: 'Tutorial de CSS'
      }
    ],
    author: {
      id: 'user4',
      name: 'David Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      verified: false
    },
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    visibility: 'public',
    reactions: { fire: 18, count: 18 },
    comments: 3,
    saved: true,
    hashtags: ['css', 'animation', 'tutorial']
  },
  {
    id: '5',
    type: 'question',
    title: '¿Mejor base de datos para aplicaciones web?',
    content: 'Estoy empezando un nuevo proyecto y no sé qué base de datos elegir. ¿PostgreSQL, MongoDB, o MySQL? ¿Cuáles son sus ventajas?',
    author: {
      id: 'user5',
      name: 'Laura Fernández',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      verified: true
    },
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    visibility: 'public',
    reactions: { fire: 9, count: 9 },
    comments: 15,
    saved: false,
    hashtags: ['database', 'postgresql', 'mongodb', 'mysql']
  }
];

// GET /api/feed - Get posts with pagination
router.get('/', (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedPosts = mockPosts.slice(startIndex, endIndex);
    const hasMore = endIndex < mockPosts.length;
    
    res.json({
      success: true,
      data: {
        posts: paginatedPosts,
        pagination: {
          page,
          limit,
          total: mockPosts.length,
          hasMore
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error fetching posts'
    });
  }
});

// POST /api/feed - Create a new post
router.post('/', (req: Request, res: Response) => {
  try {
    const { type, title, content, visibility, hashtags, media } = req.body;
    
    // Validate required fields
    if (!type || !content) {
      return res.status(400).json({
        success: false,
        error: 'Type and content are required'
      });
    }
    
    // Create new post
    const newPost = {
      id: Date.now().toString(),
      type,
      title: title || '',
      content,
      author: {
        id: 'current-user',
        name: 'Usuario Actual',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
        verified: false
      },
      createdAt: new Date().toISOString(),
      visibility: visibility || 'public',
      reactions: { fire: 0, count: 0 },
      comments: 0,
      saved: false,
      hashtags: hashtags || [],
      media: media || []
    };
    
    // Add to beginning of mock posts
    mockPosts.unshift(newPost);
    
    res.status(201).json({
      success: true,
      data: newPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error creating post'
    });
  }
});

export default router;