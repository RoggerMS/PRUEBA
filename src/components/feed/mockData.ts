import { FeedPost } from '@/types/feed';

// Mock posts used in development when the feed service is unavailable
// Updated with more realistic and current data
export const mockFeedPosts: FeedPost[] = [
  {
    id: '1',
    kind: 'question',
    author: {
      id: '1',
      name: 'María González',
      username: 'maria_g',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20student%20avatar%20female&image_size=square',
      verified: true,
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    title: '¿Cómo optimizar algoritmos de ordenamiento?',
    text: 'Estoy estudiando diferentes algoritmos de ordenamiento y me gustaría saber cuáles son las mejores prácticas para optimizarlos. ¿Alguien tiene experiencia con QuickSort vs MergeSort en proyectos reales?',
    visibility: 'public',
    hashtags: ['algoritmos', 'programacion', 'optimizacion', 'datastructures'],
    stats: { fires: 34, comments: 12, shares: 5, saves: 8, views: 180 },
    viewerState: { fired: false, saved: true, shared: false },
  },
  {
    id: '2',
    kind: 'note',
    author: {
      id: '2',
      name: 'Carlos Mendoza',
      username: 'carlos_m',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=medical%20student%20avatar%20male&image_size=square',
      verified: false,
    },
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    title: 'Apuntes de Anatomía - Sistema Cardiovascular',
    text: 'Comparto mis apuntes completos sobre el sistema cardiovascular. Incluye diagramas actualizados, funciones principales y las patologías más comunes según la literatura reciente.',
    visibility: 'public',
    hashtags: ['anatomia', 'medicina', 'cardiovascular', 'apuntes'],
    stats: { fires: 67, comments: 18, shares: 25, saves: 12, views: 420 },
    viewerState: { fired: true, saved: false, shared: false },
  },
  {
    id: '3',
    kind: 'post',
    author: {
      id: '3',
      name: 'Ana Rodríguez',
      username: 'ana_r',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=psychology%20student%20avatar%20female&image_size=square',
      verified: true,
    },
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    text: '¡Acabo de terminar mi tesis sobre neuroplasticidad y aprendizaje! Ha sido un viaje increíble de 2 años investigando cómo el cerebro se adapta. Gracias a todos los que me apoyaron en el proceso. 🧠✨ #TesisCompleta',
    visibility: 'public',
    hashtags: ['tesis', 'neuroplasticidad', 'psicologia', 'investigacion'],
    stats: { fires: 156, comments: 34, shares: 12, saves: 28, views: 750 },
    viewerState: { fired: true, saved: true, shared: false },
  },
  {
    id: '4',
    kind: 'question',
    author: {
      id: '4',
      name: 'Diego Herrera',
      username: 'diego_h',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=engineering%20student%20avatar%20male&image_size=square',
      verified: false,
    },
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    title: 'Ayuda con React y TypeScript',
    text: '¿Alguien puede explicarme las mejores prácticas para manejar estado en React con TypeScript? Estoy trabajando en un proyecto y me confundo con los tipos.',
    visibility: 'public',
    hashtags: ['react', 'typescript', 'frontend', 'ayuda'],
    stats: { fires: 28, comments: 15, shares: 3, saves: 9, views: 200 },
    viewerState: { fired: false, saved: false, shared: false },
  },
];

