// Tipos TypeScript compartidos para el sistema de clubes
// Basados en el esquema Prisma existente

export interface User {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
  email: string;
  bio: string | null;
  university: string | null;
  career: string | null;
  semester: number | null;
  interests: string | null;
  level: number;
  xp: number;
  crolars: number;
  createdAt: Date;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  avatar: string | null;
  banner: string | null;
  category: string;
  tags: string | null;
  isPrivate: boolean;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
  members?: ClubMember[];
  posts?: ClubPost[];
  events?: Event[];
}

export interface ClubMember {
  id: string;
  role: ClubRole;
  userId: string;
  clubId: string;
  joinedAt: Date;
  user?: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
    bio: string | null;
    university: string | null;
    career: string | null;
    level: number;
  };
}

export interface ClubPost {
  id: string;
  content: string;
  imageUrl: string | null;
  authorId: string;
  clubId: string;
  createdAt: Date;
  updatedAt: Date;
  author?: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
  };
}

export interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  isOnline: boolean;
  category: string;
  tags: string | null;
  maxAttendees: number | null;
  organizerId: string | null;
  clubId: string | null;
  createdAt: Date;
  updatedAt: Date;
  organizer?: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
  };
  attendances?: EventAttendance[];
}

export interface EventAttendance {
  id: string;
  status: AttendanceStatus;
  userId: string;
  eventId: string;
  createdAt: Date;
  user?: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
  };
}

// Enums
export enum ClubRole {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  MEMBER = 'MEMBER'
}

export enum AttendanceStatus {
  INTERESTED = 'INTERESTED',
  GOING = 'GOING',
  NOT_GOING = 'NOT_GOING'
}

// Tipos para formularios y requests
export interface CreateClubRequest {
  name: string;
  description: string;
  category: string;
  tags?: string[];
  isPrivate?: boolean;
  avatar?: string;
  banner?: string;
}

export interface UpdateClubRequest {
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  isPrivate?: boolean;
  avatar?: string;
  banner?: string;
}

export interface CreateClubPostRequest {
  content: string;
  imageUrl?: string;
}

export interface JoinClubRequest {
  clubId: string;
}

export interface UpdateMemberRoleRequest {
  userId: string;
  role: ClubRole;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  isOnline?: boolean;
  category: string;
  tags?: string[];
  maxAttendees?: number;
  imageUrl?: string;
}

// Tipos para respuestas de API
export interface ClubsResponse {
  clubs: Club[];
  total: number;
  hasMore: boolean;
  page: number;
  limit: number;
}

export interface ClubDetailResponse extends Club {
  members: ClubMember[];
  posts: ClubPost[];
  events: Event[];
  isUserMember: boolean;
  userRole?: ClubRole;
}

export interface ClubPostsResponse {
  posts: ClubPost[];
  total: number;
  hasMore: boolean;
}

export interface ClubMembersResponse {
  members: ClubMember[];
  total: number;
}

export interface ClubEventsResponse {
  events: Event[];
  total: number;
}

// Tipos para filtros y búsqueda
export interface ClubFilters {
  search?: string;
  category?: string;
  tags?: string[];
  isPrivate?: boolean;
  memberCountMin?: number;
  memberCountMax?: number;
  sortBy?: 'name' | 'memberCount' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ClubStats {
  totalClubs: number;
  totalMembers: number;
  totalPosts: number;
  totalEvents: number;
  categoriesCount: Record<string, number>;
  recentActivity: {
    newClubs: number;
    newMembers: number;
    newPosts: number;
    newEvents: number;
  };
}

// Categorías predefinidas para clubes
export const CLUB_CATEGORIES = [
  'Académico',
  'Deportes',
  'Arte y Cultura',
  'Tecnología',
  'Ciencias',
  'Idiomas',
  'Música',
  'Literatura',
  'Debate',
  'Voluntariado',
  'Emprendimiento',
  'Gaming',
  'Fotografía',
  'Cocina',
  'Viajes',
  'Otros'
] as const;

export type ClubCategory = typeof CLUB_CATEGORIES[number];

// Tags populares para clubes
export const POPULAR_CLUB_TAGS = [
  'estudio',
  'colaborativo',
  'competitivo',
  'principiantes',
  'avanzado',
  'presencial',
  'virtual',
  'semanal',
  'mensual',
  'proyecto',
  'investigación',
  'práctica',
  'networking',
  'certificación',
  'workshop'
] as const;

export type PopularClubTag = typeof POPULAR_CLUB_TAGS[number];