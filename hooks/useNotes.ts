import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Note {
  id: string;
  title: string;
  description: string;
  author: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  career: string;
  category: string;
  tags: string[];
  price: number;
  rating: number;
  downloads: number;
  views: number;
  createdAt: string;
  files: Array<{
    id: string;
    name: string;
    type: 'pdf' | 'image' | 'doc';
    url: string;
    pages?: number;
  }>;
}

interface NoteDetail extends Note {
  comments: Array<{
    id: string;
    user: {
      name: string;
      avatar: string;
    };
    content: string;
    rating: number;
    createdAt: string;
  }>;
}

interface NotesFilters {
  category?: string;
  career?: string;
  sortBy?: string;
  search?: string;
}

// Hook to fetch notes list
export function useNotes(filters: NotesFilters = {}) {
  return useQuery({
    queryKey: ['notes', filters],
    queryFn: async (): Promise<Note[]> => {
      const params = new URLSearchParams();
      
      if (filters.category && filters.category !== 'all') {
        params.append('category', filters.category);
      }
      if (filters.career && filters.career !== 'all') {
        params.append('career', filters.career);
      }
      if (filters.sortBy) {
        params.append('sortBy', filters.sortBy);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }

      const response = await fetch(`/api/notes?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }
      const data = await response.json();
      return data.notes;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to fetch a single note by ID
export function useNote(noteId: string) {
  return useQuery({
    queryKey: ['notes', noteId],
    queryFn: async (): Promise<NoteDetail> => {
      const response = await fetch(`/api/notes/${noteId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch note');
      }
      return response.json();
    },
    enabled: !!noteId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to like/unlike a note
export function useLikeNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId, liked }: { noteId: string; liked: boolean }) => {
      const response = await fetch(`/api/notes/${noteId}/like`, {
        method: liked ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to update like status');
      }
      
      return response.json();
    },
    onSuccess: (_, { noteId, liked }) => {
      // Update the notes list cache
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      // Update the specific note cache
      queryClient.invalidateQueries({ queryKey: ['notes', noteId] });
      
      toast.success(liked ? 'Eliminado de favoritos' : 'Agregado a favoritos');
    },
    onError: () => {
      toast.error('Error al actualizar favoritos');
    },
  });
}

// Hook to add a comment to a note
export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId, content, rating }: { noteId: string; content: string; rating: number }) => {
      const response = await fetch(`/api/notes/${noteId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, rating }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      return response.json();
    },
    onSuccess: (_, { noteId }) => {
      // Update the specific note cache to include the new comment
      queryClient.invalidateQueries({ queryKey: ['notes', noteId] });
      toast.success('Comentario agregado');
    },
    onError: () => {
      toast.error('Error al agregar comentario');
    },
  });
}

// Hook to download a note
export function useDownloadNote() {
  return useMutation({
    mutationFn: async (noteId: string) => {
      const response = await fetch(`/api/notes/${noteId}/download`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to download note');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast.success('Descarga iniciada');
    },
    onError: () => {
      toast.error('Error al descargar');
    },
  });
}