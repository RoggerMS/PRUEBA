import { Event } from '@/types/event';

export const seedEvents: Event[] = [
  {
    id: '1',
    title: 'Conferencia de Tecnología 2024',
    description: 'Una conferencia sobre las últimas tendencias en tecnología, incluyendo IA, blockchain y desarrollo web.',
    startDate: new Date('2024-03-15T09:00:00Z'),
    endDate: new Date('2024-03-15T18:00:00Z'),
    location: {
      name: 'Centro de Convenciones Madrid',
      address: 'Av. del Partenón, 5, 28042 Madrid',
      city: 'Madrid',
      country: 'España'
    },
    organizer: {
      id: 'org1',
      name: 'TechEvents España',
      email: 'info@techevents.es',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20tech%20company%20logo&image_size=square'
    },
    category: 'technology',
    type: 'conference',
    price: 150,
    currency: 'EUR',
    maxAttendees: 500,
    currentAttendees: 342,
    tags: ['tecnología', 'IA', 'blockchain', 'desarrollo'],
    difficulty: 'intermediate',
    rating: 4.8,
    reviewCount: 156,
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20technology%20conference%20hall%20with%20screens&image_size=landscape_16_9',
    featured: true,
    status: 'published'
  },
  {
    id: '2',
    title: 'Workshop de React Avanzado',
    description: 'Aprende técnicas avanzadas de React incluyendo hooks personalizados, optimización de rendimiento y patrones de diseño.',
    startDate: new Date('2024-03-20T10:00:00Z'),
    endDate: new Date('2024-03-20T16:00:00Z'),
    location: {
      name: 'Coworking Tech Hub',
      address: 'Calle Gran Vía, 28, 28013 Madrid',
      city: 'Madrid',
      country: 'España'
    },
    organizer: {
      id: 'org2',
      name: 'React Masters',
      email: 'hello@reactmasters.dev',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=react%20logo%20professional%20developer&image_size=square'
    },
    category: 'technology',
    type: 'workshop',
    price: 75,
    currency: 'EUR',
    maxAttendees: 30,
    currentAttendees: 28,
    tags: ['react', 'javascript', 'frontend', 'desarrollo'],
    difficulty: 'advanced',
    rating: 4.9,
    reviewCount: 89,
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=coding%20workshop%20with%20laptops%20and%20screens&image_size=landscape_16_9',
    featured: true,
    status: 'published'
  },
  {
    id: '3',
    title: 'Networking Empresarial',
    description: 'Evento de networking para profesionales del sector tecnológico. Conecta con otros profesionales y expande tu red.',
    startDate: new Date('2024-03-25T19:00:00Z'),
    endDate: new Date('2024-03-25T22:00:00Z'),
    location: {
      name: 'Hotel Intercontinental',
      address: 'Paseo de la Castellana, 49, 28046 Madrid',
      city: 'Madrid',
      country: 'España'
    },
    organizer: {
      id: 'org3',
      name: 'Business Connect',
      email: 'events@businessconnect.es',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=business%20networking%20professional%20logo&image_size=square'
    },
    category: 'business',
    type: 'networking',
    price: 0,
    currency: 'EUR',
    maxAttendees: 100,
    currentAttendees: 67,
    tags: ['networking', 'business', 'profesional', 'contactos'],
    difficulty: 'beginner',
    rating: 4.5,
    reviewCount: 234,
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20networking%20event%20elegant%20venue&image_size=landscape_16_9',
    featured: false,
    status: 'published'
  },
  {
    id: '4',
    title: 'Hackathon de Sostenibilidad',
    description: 'Hackathon de 48 horas enfocado en crear soluciones tecnológicas para problemas medioambientales.',
    startDate: new Date('2024-04-05T18:00:00Z'),
    endDate: new Date('2024-04-07T18:00:00Z'),
    location: {
      name: 'Campus Universidad Politécnica',
      address: 'Av. Complutense, s/n, 28040 Madrid',
      city: 'Madrid',
      country: 'España'
    },
    organizer: {
      id: 'org4',
      name: 'Green Tech Initiative',
      email: 'info@greentech.org',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=green%20technology%20environmental%20logo&image_size=square'
    },
    category: 'technology',
    type: 'hackathon',
    price: 25,
    currency: 'EUR',
    maxAttendees: 150,
    currentAttendees: 89,
    tags: ['hackathon', 'sostenibilidad', 'medioambiente', 'innovación'],
    difficulty: 'intermediate',
    rating: 4.7,
    reviewCount: 67,
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=hackathon%20coding%20event%20green%20technology&image_size=landscape_16_9',
    featured: true,
    status: 'published'
  },
  {
    id: '5',
    title: 'Curso de Diseño UX/UI',
    description: 'Curso intensivo de diseño de experiencia de usuario e interfaz. Aprende los fundamentos del diseño centrado en el usuario.',
    startDate: new Date('2024-04-10T09:00:00Z'),
    endDate: new Date('2024-04-12T17:00:00Z'),
    location: {
      name: 'Escuela de Diseño Digital',
      address: 'Calle Serrano, 45, 28001 Madrid',
      city: 'Madrid',
      country: 'España'
    },
    organizer: {
      id: 'org5',
      name: 'Design Academy',
      email: 'cursos@designacademy.es',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=design%20academy%20creative%20logo&image_size=square'
    },
    category: 'design',
    type: 'course',
    price: 299,
    currency: 'EUR',
    maxAttendees: 25,
    currentAttendees: 18,
    tags: ['diseño', 'UX', 'UI', 'experiencia usuario'],
    difficulty: 'beginner',
    rating: 4.6,
    reviewCount: 145,
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=UX%20UI%20design%20workshop%20creative%20workspace&image_size=landscape_16_9',
    featured: false,
    status: 'published'
  }
];

// Función para obtener eventos aleatorios
export function getRandomEvents(count: number = 5): Event[] {
  const shuffled = [...seedEvents].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Función para obtener eventos por categoría
export function getEventsByCategory(category: string): Event[] {
  return seedEvents.filter(event => event.category === category);
}

// Función para obtener eventos destacados
export function getFeaturedEvents(): Event[] {
  return seedEvents.filter(event => event.featured);
}

// Función para obtener evento por ID
export function getEventById(id: string): Event | undefined {
  return seedEvents.find(event => event.id === id);
}