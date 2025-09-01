import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  isOnline: boolean;
  category: string;
  tags: string[];
  maxAttendees: number | null;
  currentAttendees: number;
  imageUrl: string | null;
  price: number;
  isRegistered: boolean;
  canEdit: boolean;
  organizer: {
    id: string;
    name: string;
    image: string | null;
  };
  club: {
    id: string;
    name: string;
    imageUrl: string | null;
  } | null;
  createdAt: string;
}

interface EventsResponse {
  events: Event[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface UseEventsOptions {
  category?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'date' | 'title' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export function useEvents(options: UseEventsOptions = {}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.category && options.category !== 'Todos') params.append('category', options.category);
      if (options.search) params.append('search', options.search);
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.sortOrder) params.append('sortOrder', options.sortOrder);
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());

      const response = await fetch(`/api/events?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Error al cargar eventos');
      }

      const data: EventsResponse = await response.json();
      setEvents(data.events);
      setPagination({
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
        hasNext: data.hasNext,
        hasPrev: data.hasPrev,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast.error('Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  }, [options.category, options.search, options.startDate, options.endDate, options.sortBy, options.sortOrder, options.page, options.limit]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const refetch = useCallback(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    pagination,
    refetch,
  };
}

export function useEventRegistration() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const registerForEvent = useCallback(async (eventId: string) => {
    if (!session) {
      toast.error('Debes iniciar sesión para registrarte');
      return false;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al registrarse');
      }

      const data = await response.json();
      toast.success(data.message || 'Te has registrado exitosamente');
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al registrarse');
      return false;
    } finally {
      setLoading(false);
    }
  }, [session]);

  const unregisterFromEvent = useCallback(async (eventId: string) => {
    if (!session) {
      toast.error('Debes iniciar sesión');
      return false;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al cancelar registro');
      }

      const data = await response.json();
      toast.success(data.message || 'Registro cancelado exitosamente');
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cancelar registro');
      return false;
    } finally {
      setLoading(false);
    }
  }, [session]);

  return {
    registerForEvent,
    unregisterFromEvent,
    loading,
  };
}

export function useMyEvents() {
  const { data: session } = useSession();
  const [myEvents, setMyEvents] = useState<{
    registered: Event[];
    organized: Event[];
    past: Event[];
    stats: {
      totalOrganized: number;
      totalAttended: number;
      upcomingRegistered: number;
      upcomingOrganized: number;
    };
  }>({ registered: [], organized: [], past: [], stats: { totalOrganized: 0, totalAttended: 0, upcomingRegistered: 0, upcomingOrganized: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyEvents = useCallback(async () => {
    if (!session) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/events/my-events');
      if (!response.ok) {
        throw new Error('Error al cargar mis eventos');
      }

      const data = await response.json();
      setMyEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast.error('Error al cargar mis eventos');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchMyEvents();
  }, [fetchMyEvents]);

  const refetch = useCallback(() => {
    fetchMyEvents();
  }, [fetchMyEvents]);

  return {
    myEvents,
    loading,
    error,
    refetch,
  };
}