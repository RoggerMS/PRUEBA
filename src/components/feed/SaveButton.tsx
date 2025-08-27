'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SaveButtonProps {
  postId: string;
  initialSaved?: boolean;
  initialSaveCount?: number;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showCount?: boolean;
  className?: string;
}

interface SaveResponse {
  saved: boolean;
  saveCount: number;
}

export function SaveButton({ 
  postId, 
  initialSaved = false, 
  initialSaveCount = 0,
  variant = 'ghost',
  size = 'sm',
  showCount = true,
  className 
}: SaveButtonProps) {
  const [optimisticSaved, setOptimisticSaved] = useState(initialSaved);
  const [optimisticCount, setOptimisticCount] = useState(initialSaveCount);
  const queryClient = useQueryClient();

  // Query to get current save status
  const { data: saveData } = useQuery({
    queryKey: ['post-save', postId],
    queryFn: async (): Promise<SaveResponse> => {
      const response = await fetch(`/api/feed/${postId}/save`);
      if (!response.ok) {
        throw new Error('Failed to fetch save status');
      }
      return response.json();
    },
    initialData: {
      saved: initialSaved,
      saveCount: initialSaveCount
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation to toggle save status
  const saveMutation = useMutation({
    mutationFn: async (): Promise<SaveResponse> => {
      const response = await fetch(`/api/feed/${postId}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle save');
      }
      
      return response.json();
    },
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['post-save', postId] });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData<SaveResponse>(['post-save', postId]);
      
      // Optimistically update
      const newSaved = !optimisticSaved;
      const newCount = optimisticCount + (newSaved ? 1 : -1);
      
      setOptimisticSaved(newSaved);
      setOptimisticCount(Math.max(0, newCount));
      
      // Update query cache optimistically
      queryClient.setQueryData<SaveResponse>(['post-save', postId], {
        saved: newSaved,
        saveCount: Math.max(0, newCount)
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      // Revert optimistic update on error
      if (context?.previousData) {
        queryClient.setQueryData(['post-save', postId], context.previousData);
        setOptimisticSaved(context.previousData.saved);
        setOptimisticCount(context.previousData.saveCount);
      }
      
      toast.error('Error al guardar el post');
    },
    onSuccess: (data) => {
      // Update with server response
      setOptimisticSaved(data.saved);
      setOptimisticCount(data.saveCount);
      
      // Update query cache with server data
      queryClient.setQueryData(['post-save', postId], data);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['saved-posts'] });
      
      // Show success message
      toast.success(
        data.saved ? 'Post guardado' : 'Post removido de guardados',
        {
          duration: 2000
        }
      );
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['post-save', postId] });
    }
  });

  const handleSave = () => {
    if (!saveMutation.isPending) {
      saveMutation.mutate();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSave();
    }
  };

  // Use optimistic values or fallback to query data
  const isSaved = optimisticSaved ?? saveData?.saved ?? false;
  const saveCount = optimisticCount ?? saveData?.saveCount ?? 0;
  const isLoading = saveMutation.isPending;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSave}
      onKeyDown={handleKeyDown}
      disabled={isLoading}
      className={cn(
        'group transition-all duration-200',
        isSaved && 'text-blue-600 hover:text-blue-700',
        !isSaved && 'text-gray-500 hover:text-blue-600',
        isLoading && 'opacity-70',
        className
      )}
      aria-label={isSaved ? 'Remover de guardados' : 'Guardar post'}
      aria-pressed={isSaved}
    >
      <div className="flex items-center space-x-1.5">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isSaved ? (
          <BookmarkCheck 
            className={cn(
              'w-4 h-4 transition-transform duration-200',
              'group-hover:scale-110'
            )} 
          />
        ) : (
          <Bookmark 
            className={cn(
              'w-4 h-4 transition-all duration-200',
              'group-hover:scale-110 group-hover:fill-current'
            )} 
          />
        )}
        
        {showCount && (
          <span className={cn(
            'text-sm font-medium transition-colors duration-200',
            saveCount > 0 ? 'opacity-100' : 'opacity-0'
          )}>
            {saveCount > 0 && (
              <span className="tabular-nums">
                {saveCount > 999 ? `${(saveCount / 1000).toFixed(1)}k` : saveCount}
              </span>
            )}
          </span>
        )}
      </div>
    </Button>
  );
}

// Compact version for use in post cards
export function SaveButtonCompact({ postId, initialSaved, initialSaveCount }: {
  postId: string;
  initialSaved?: boolean;
  initialSaveCount?: number;
}) {
  return (
    <SaveButton
      postId={postId}
      initialSaved={initialSaved}
      initialSaveCount={initialSaveCount}
      variant="ghost"
      size="sm"
      showCount={false}
      className="h-8 px-2"
    />
  );
}

// Version with count for detailed views
export function SaveButtonWithCount({ postId, initialSaved, initialSaveCount }: {
  postId: string;
  initialSaved?: boolean;
  initialSaveCount?: number;
}) {
  return (
    <SaveButton
      postId={postId}
      initialSaved={initialSaved}
      initialSaveCount={initialSaveCount}
      variant="ghost"
      size="default"
      showCount={true}
      className="h-9 px-3"
    />
  );
}