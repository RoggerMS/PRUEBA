// Event-related type definitions

export interface Event {
  id: string;
  title: string;
  description: string;
  image?: string;
  imageUrl?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  isOnline: boolean;
  category: EventCategory;
  type: EventType;
  organizer: string | {
    id: string;
    name: string;
    image?: string;
    imageUrl?: string | null;
  };
  organizerId: string;
  organizerAvatar?: string;
  attendees: number;
  currentAttendees: number;
  maxAttendees: number;
  price: number;
  tags: string[];
  status: EventStatus;
  isRegistered?: boolean;
  isFeatured: boolean;
  difficulty?: EventDifficulty;
  duration?: string;
  prizes?: string[];
  requirements?: string[];
  speakers?: string[];
  registrationDate?: string;
  attendanceStatus?: AttendanceStatus;
  createdAt: string;
  updatedAt: string;
  clubId?: string;
  club?: {
    id: string;
    name: string;
    avatar?: string;
    imageUrl?: string;
  };
  canEdit?: boolean;
}

export type EventCategory = 
  | 'TECHNOLOGY'
  | 'ACADEMIC'
  | 'ARTS'
  | 'SPORTS'
  | 'SOCIAL'
  | 'BUSINESS'
  | 'HEALTH'
  | 'SCIENCE';

export type EventType = 
  | 'WORKSHOP'
  | 'CONFERENCE'
  | 'SEMINAR'
  | 'COMPETITION'
  | 'SOCIAL'
  | 'MEETING'
  | 'HACKATHON'
  | 'NETWORKING';

export type EventStatus = 
  | 'draft'
  | 'published'
  | 'active'
  | 'upcoming'
  | 'ongoing'
  | 'completed'
  | 'cancelled';

export type EventDifficulty = 
  | 'BEGINNER'
  | 'INTERMEDIATE'
  | 'ADVANCED'
  | 'EXPERT';

export type AttendanceStatus = 
  | 'confirmed'
  | 'pending'
  | 'attended'
  | 'no-show'
  | 'cancelled';

// Extended filter interface that includes all possible filter options
export interface ExtendedEventFilterData {
  search?: string;
  categories?: string[];
  types?: string[];
  difficulties?: string[];
  isOnline?: boolean;
  isFree?: boolean;
  hasAvailableSpots?: boolean;
  dateFrom?: string;
  dateTo?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'date' | 'title' | 'popularity' | 'price' | 'attendees';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Event registration interface
export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  registrationDate: string;
  attendanceStatus: AttendanceStatus;
  notes?: string;
}

// Event comment interface
export interface EventComment {
  id: string;
  eventId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

// Event statistics interface
export interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  totalAttendees: number;
  averageAttendance: number;
  popularCategories: Array<{
    category: EventCategory;
    count: number;
  }>;
}

// API response interfaces
export interface EventsResponse {
  events: Event[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface EventDetailResponse {
  event: Event;
  isRegistered: boolean;
  registrationCount: number;
  comments: EventComment[];
  relatedEvents: Event[];
}

// Form data interfaces
export interface CreateEventData {
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  location?: string;
  isOnline: boolean;
  category: EventCategory;
  type: EventType;
  maxAttendees: number;
  price: number;
  tags: string[];
  imageUrl?: string;
  clubId?: string;
  difficulty?: EventDifficulty;
  requirements?: string[];
  prizes?: string[];
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string;
}