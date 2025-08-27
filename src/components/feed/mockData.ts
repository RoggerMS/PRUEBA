import { FeedPost } from '@/types/feed';

// Mock posts used in development when the feed service is unavailable
export const mockFeedPosts: FeedPost[] = [
  {
    id: '1',
    kind: 'question',
    author: {
      id: '1',
      name: 'María González',
      username: 'maria_g',
      avatar: 'https://placehold.co/100x100',
      verified: true,
    },
    createdAt: new Date().toISOString(),
    title: '¿Cómo optimizar algoritmos de ordenamiento?',
    text: 'Estoy estudiando diferentes algoritmos de ordenamiento y me gustaría saber cuáles son las mejores prácticas para optimizarlos. ¿Alguien tiene experiencia con QuickSort vs MergeSort?',
    visibility: 'public',
    hashtags: ['algoritmos', 'programacion', 'optimizacion'],
    stats: { fires: 24, comments: 8, shares: 3, saves: 5, views: 120 },
    viewerState: { fired: false, saved: true, shared: false },
  },
  {
    id: '2',
    kind: 'note',
    author: {
      id: '2',
      name: 'Carlos Mendoza',
      username: 'carlos_m',
      avatar: 'https://placehold.co/100x100',
      verified: false,
    },
    createdAt: new Date().toISOString(),
    title: 'Apuntes de Anatomía - Sistema Cardiovascular',
    text: 'Comparto mis apuntes completos sobre el sistema cardiovascular. Incluye diagramas, funciones principales y patologías más comunes.',
    visibility: 'public',
    hashtags: ['anatomia', 'medicina', 'cardiovascular'],
    stats: { fires: 45, comments: 12, shares: 18, saves: 7, views: 300 },
    viewerState: { fired: true, saved: false, shared: false },
  },
  {
    id: '3',
    kind: 'post',
    author: {
      id: '3',
      name: 'Ana Rodríguez',
      username: 'ana_r',
      avatar: 'https://placehold.co/100x100',
      verified: true,
    },
    createdAt: new Date().toISOString(),
    text: '¡Acabo de terminar mi tesis sobre neuroplasticidad! Ha sido un viaje increíble de 2 años. Gracias a todos los que me apoyaron en el proceso. 🧠✨',
    visibility: 'public',
    hashtags: ['tesis', 'neuroplasticidad', 'psicologia'],
    stats: { fires: 89, comments: 23, shares: 7, saves: 15, views: 500 },
    viewerState: { fired: true, saved: true, shared: false },
  },
];

