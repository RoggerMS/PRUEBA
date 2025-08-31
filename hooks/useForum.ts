import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Types
interface Author {
  id: string;
  name: string;
  avatar: string;
  level: string;
  points: number;
}

interface Question {
  id: string;
  title: string;
  content: string;
  author: Author;
  subject: string;
  career: string;
  tags: string[];
  votes: number;
  answers: number;
  views: number;
  createdAt: Date;
  hasAcceptedAnswer: boolean;
  bounty: number;
}

interface Answer {
  id: string;
  content: string;
  author: Author;
  votes: number;
  createdAt: Date;
  isAccepted: boolean;
  isEdited: boolean;
}

interface QuestionFilters {
  search?: string;
  subject?: string;
  career?: string;
  sortBy?: 'recent' | 'votes' | 'answers' | 'views';
  page?: number;
  limit?: number;
}

interface CreateQuestionData {
  title: string;
  content: string;
  subject: string;
  career: string;
  tags: string[];
  bounty?: number;
}

interface CreateAnswerData {
  content: string;
}

interface VoteData {
  type: 'up' | 'down';
}

// API functions
const fetchQuestions = async (filters: QuestionFilters = {}): Promise<Question[]> => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.subject && filters.subject !== 'Todas') params.append('subject', filters.subject);
  if (filters.career && filters.career !== 'Todas') params.append('career', filters.career);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const response = await fetch(`/api/forum/questions?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch questions');
  }
  return response.json();
};

const fetchQuestion = async (id: string): Promise<Question> => {
  const response = await fetch(`/api/forum/questions/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch question');
  }
  return response.json();
};

const fetchAnswers = async (questionId: string): Promise<Answer[]> => {
  const response = await fetch(`/api/forum/questions/${questionId}/answers`);
  if (!response.ok) {
    throw new Error('Failed to fetch answers');
  }
  return response.json();
};

const createQuestion = async (data: CreateQuestionData): Promise<Question> => {
  const response = await fetch('/api/forum/questions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create question');
  }
  return response.json();
};

const createAnswer = async (questionId: string, data: CreateAnswerData): Promise<Answer> => {
  const response = await fetch(`/api/forum/questions/${questionId}/answers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create answer');
  }
  return response.json();
};

const voteOnQuestion = async (questionId: string, data: VoteData): Promise<void> => {
  const response = await fetch(`/api/forum/questions/${questionId}/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to vote on question');
  }
};

const voteOnAnswer = async (answerId: string, data: VoteData): Promise<void> => {
  const response = await fetch(`/api/forum/answers/${answerId}/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to vote on answer');
  }
};

const acceptAnswer = async (questionId: string, answerId: string): Promise<void> => {
  const response = await fetch(`/api/forum/questions/${questionId}/answers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'accept', answerId }),
  });
  if (!response.ok) {
    throw new Error('Failed to accept answer');
  }
};

// React Query hooks
export const useQuestions = (filters: QuestionFilters = {}) => {
  return useQuery({
    queryKey: ['questions', filters],
    queryFn: () => fetchQuestions(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useQuestion = (id: string) => {
  return useQuery({
    queryKey: ['question', id],
    queryFn: () => fetchQuestion(id),
    enabled: !!id,
  });
};

export const useAnswers = (questionId: string) => {
  return useQuery({
    queryKey: ['answers', questionId],
    queryFn: () => fetchAnswers(questionId),
    enabled: !!questionId,
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast.success('Pregunta creada exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al crear la pregunta: ' + error.message);
    },
  });
};

export const useCreateAnswer = (questionId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAnswerData) => createAnswer(questionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['answers', questionId] });
      queryClient.invalidateQueries({ queryKey: ['question', questionId] });
      toast.success('Respuesta enviada exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al enviar la respuesta: ' + error.message);
    },
  });
};

export const useVoteQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ questionId, data }: { questionId: string; data: VoteData }) => 
      voteOnQuestion(questionId, data),
    onSuccess: (_, { questionId }) => {
      queryClient.invalidateQueries({ queryKey: ['question', questionId] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
    onError: (error: Error) => {
      toast.error('Error al votar: ' + error.message);
    },
  });
};

export const useVoteAnswer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ answerId, data }: { answerId: string; data: VoteData }) => 
      voteOnAnswer(answerId, data),
    onSuccess: (_, { answerId }) => {
      // Find which question this answer belongs to and invalidate its answers
      queryClient.invalidateQueries({ queryKey: ['answers'] });
    },
    onError: (error: Error) => {
      toast.error('Error al votar: ' + error.message);
    },
  });
};

export const useAcceptAnswer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ questionId, answerId }: { questionId: string; answerId: string }) => 
      acceptAnswer(questionId, answerId),
    onSuccess: (_, { questionId }) => {
      queryClient.invalidateQueries({ queryKey: ['answers', questionId] });
      queryClient.invalidateQueries({ queryKey: ['question', questionId] });
      toast.success('Respuesta marcada como aceptada');
    },
    onError: (error: Error) => {
      toast.error('Error al aceptar la respuesta: ' + error.message);
    },
  });
};