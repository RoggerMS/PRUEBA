'use client';

import { useQuery } from '@tanstack/react-query';

// Hook and types for retrieving the user's Crolars balance and transactions
export interface CrolarTransaction {
  id: string;
  amount: number;
  type: 'EARNED' | 'SPENT' | 'BONUS' | 'PENALTY';
  description: string;
  relatedId?: string | null;
  relatedType?: string | null;
  createdAt: string;
}

interface CrolarsResponse {
  user: {
    id: string;
    crolars: number;
    level: number;
    xp: number;
  };
  transactions: CrolarTransaction[];
}

export function useCrolars() {
  return useQuery<CrolarsResponse>({
    queryKey: ['crolars'],
    queryFn: async () => {
      const res = await fetch('/api/gamification/crolars?limit=100');
      if (!res.ok) {
        throw new Error('Failed to fetch crolars');
      }
      return res.json();
    }
  });
}

