import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useNotifications } from './useNotifications';

export interface WorkspaceBoard {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  isPublic: boolean;
  collaborators?: WorkspaceCollaborator[];
  createdAt: string;
  updatedAt: string;
  blocks: WorkspaceBlockData[];
  owner: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export interface WorkspaceBlockData {
  id: string;
  type: 'DOCS' | 'KANBAN' | 'FRASES';
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  completed: boolean;
  isPublic: boolean;
  collaborators?: WorkspaceCollaborator[];
  createdAt: string;
  updatedAt: string;
  lastModifiedBy?: {
    id: string;
    name: string;
    image?: string;
  };
}

export interface WorkspaceCollaborator {
  id: string;
  userId: string;
  role: 'OWNER' | 'EDITOR' | 'VIEWER';
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  addedAt: string;
}

export interface WorkspaceStats {
  boards: number;
  blocks: number;
  docs: number;
  kanban: number;
  frases: number;
  collaborators: number;
  sharedBoards: number;
}

export interface UseWorkspaceReturn {
  // State
  boards: WorkspaceBoard[];
  currentBoard: WorkspaceBoard | null;
  stats: WorkspaceStats | null;
  isLoading: boolean;
  error: string | null;
  
  // Board operations
  loadBoards: () => Promise<void>;
  createBoard: (data: { name: string; description?: string; isPublic?: boolean }) => Promise<void>;
  updateBoard: (boardId: string, data: Partial<WorkspaceBoard>) => Promise<void>;
  deleteBoard: (boardId: string) => Promise<void>;
  duplicateBoard: (boardId: string) => Promise<void>;
  setCurrentBoard: (board: WorkspaceBoard | null) => void;
  
  // Block operations
  createBlock: (boardId: string, data: { type: 'DOCS' | 'KANBAN' | 'FRASES'; title: string; x?: number; y?: number }) => Promise<void>;
  updateBlock: (blockId: string, data: Partial<WorkspaceBlockData>) => Promise<void>;
  deleteBlock: (blockId: string) => Promise<void>;
  duplicateBlock: (blockId: string) => Promise<void>;
  
  // Collaboration
  inviteCollaborator: (boardId: string, email: string, role: 'EDITOR' | 'VIEWER') => Promise<void>;
  removeCollaborator: (boardId: string, userId: string) => Promise<void>;
  updateCollaboratorRole: (boardId: string, userId: string, role: 'EDITOR' | 'VIEWER') => Promise<void>;
  
  // Sharing
  shareBoard: (boardId: string) => Promise<string>;
  getSharedBoards: () => Promise<WorkspaceBoard[]>;
  
  // Stats
  loadStats: () => Promise<void>;
}

export function useWorkspace(): UseWorkspaceReturn {
  const { data: session } = useSession();
  const { createNotification } = useNotifications();
  
  const [boards, setBoards] = useState<WorkspaceBoard[]>([]);
  const [currentBoard, setCurrentBoard] = useState<WorkspaceBoard | null>(null);
  const [stats, setStats] = useState<WorkspaceStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetcher = async (url: string, options?: RequestInit) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Request failed');
    }

    return response.json();
  };

  const loadBoards = useCallback(async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetcher('/api/workspace/boards');
      setBoards(data.boards || []);
      
      // Set default board if none selected
      if (!currentBoard && data.boards?.length > 0) {
        const defaultBoard = data.boards.find((b: WorkspaceBoard) => b.isDefault) || data.boards[0];
        setCurrentBoard(defaultBoard);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error('Error al cargar las pizarras');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, currentBoard]);

  const createBoard = async (data: { name: string; description?: string; isPublic?: boolean }) => {
    try {
      const response = await fetcher('/api/workspace/boards', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      await loadBoards();
      toast.success('Pizarra creada exitosamente');
      
      return response.board;
    } catch (err: any) {
      toast.error('Error al crear la pizarra');
      throw err;
    }
  };

  const updateBoard = async (boardId: string, data: Partial<WorkspaceBoard>) => {
    try {
      await fetcher(`/api/workspace/boards/${boardId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      
      // Update local state
      setBoards(prev => prev.map(board => 
        board.id === boardId ? { ...board, ...data } : board
      ));
      
      if (currentBoard?.id === boardId) {
        setCurrentBoard(prev => prev ? { ...prev, ...data } : null);
      }
      
      toast.success('Pizarra actualizada exitosamente');
    } catch (err: any) {
      toast.error('Error al actualizar la pizarra');
      throw err;
    }
  };

  const deleteBoard = async (boardId: string) => {
    try {
      await fetcher(`/api/workspace/boards/${boardId}`, {
        method: 'DELETE',
      });
      
      setBoards(prev => prev.filter(board => board.id !== boardId));
      
      if (currentBoard?.id === boardId) {
        setCurrentBoard(null);
      }
      
      toast.success('Pizarra eliminada exitosamente');
    } catch (err: any) {
      toast.error('Error al eliminar la pizarra');
      throw err;
    }
  };

  const duplicateBoard = async (boardId: string) => {
    try {
      const response = await fetcher(`/api/workspace/boards/${boardId}/duplicate`, {
        method: 'POST',
      });
      
      await loadBoards();
      toast.success('Pizarra duplicada exitosamente');
      
      return response.board;
    } catch (err: any) {
      toast.error('Error al duplicar la pizarra');
      throw err;
    }
  };

  const createBlock = async (boardId: string, data: { type: 'DOCS' | 'KANBAN' | 'FRASES'; title: string; x?: number; y?: number }) => {
    try {
      const response = await fetcher('/api/workspace/blocks', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          boardId,
          x: data.x ?? Math.random() * 500,
          y: data.y ?? Math.random() * 500,
          width: 300,
          height: 200,
        }),
      });
      
      // Update current board with new block
      if (currentBoard?.id === boardId) {
        setCurrentBoard(prev => prev ? {
          ...prev,
          blocks: [...prev.blocks, response.block]
        } : null);
      }
      
      toast.success('Bloque creado exitosamente');
      return response.block;
    } catch (err: any) {
      toast.error('Error al crear el bloque');
      throw err;
    }
  };

  const updateBlock = async (blockId: string, data: Partial<WorkspaceBlockData>) => {
    try {
      await fetcher(`/api/workspace/blocks/${blockId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      
      // Update local state
      if (currentBoard) {
        setCurrentBoard(prev => prev ? {
          ...prev,
          blocks: prev.blocks.map(block => 
            block.id === blockId ? { ...block, ...data } : block
          )
        } : null);
      }
      
      toast.success('Bloque actualizado exitosamente');
    } catch (err: any) {
      toast.error('Error al actualizar el bloque');
      throw err;
    }
  };

  const deleteBlock = async (blockId: string) => {
    try {
      await fetcher(`/api/workspace/blocks/${blockId}`, {
        method: 'DELETE',
      });
      
      // Update local state
      if (currentBoard) {
        setCurrentBoard(prev => prev ? {
          ...prev,
          blocks: prev.blocks.filter(block => block.id !== blockId)
        } : null);
      }
      
      toast.success('Bloque eliminado exitosamente');
    } catch (err: any) {
      toast.error('Error al eliminar el bloque');
      throw err;
    }
  };

  const duplicateBlock = async (blockId: string) => {
    try {
      const response = await fetcher(`/api/workspace/blocks/${blockId}/duplicate`, {
        method: 'POST',
      });
      
      // Update current board with duplicated block
      if (currentBoard) {
        setCurrentBoard(prev => prev ? {
          ...prev,
          blocks: [...prev.blocks, response.block]
        } : null);
      }
      
      toast.success('Bloque duplicado exitosamente');
      return response.block;
    } catch (err: any) {
      toast.error('Error al duplicar el bloque');
      throw err;
    }
  };

  const inviteCollaborator = async (boardId: string, email: string, role: 'EDITOR' | 'VIEWER') => {
    try {
      await fetcher(`/api/workspace/boards/${boardId}/collaborators`, {
        method: 'POST',
        body: JSON.stringify({ email, role }),
      });
      
      // Create notification for invited user
      await createNotification({
        type: 'workspace_invite',
        message: `Te han invitado a colaborar en una pizarra`,
        metadata: JSON.stringify({ boardId, role })
      });
      
      await loadBoards();
      toast.success('Colaborador invitado exitosamente');
    } catch (err: any) {
      toast.error('Error al invitar colaborador');
      throw err;
    }
  };

  const removeCollaborator = async (boardId: string, userId: string) => {
    try {
      await fetcher(`/api/workspace/boards/${boardId}/collaborators/${userId}`, {
        method: 'DELETE',
      });
      
      await loadBoards();
      toast.success('Colaborador removido exitosamente');
    } catch (err: any) {
      toast.error('Error al remover colaborador');
      throw err;
    }
  };

  const updateCollaboratorRole = async (boardId: string, userId: string, role: 'EDITOR' | 'VIEWER') => {
    try {
      await fetcher(`/api/workspace/boards/${boardId}/collaborators/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });
      
      await loadBoards();
      toast.success('Rol de colaborador actualizado exitosamente');
    } catch (err: any) {
      toast.error('Error al actualizar rol de colaborador');
      throw err;
    }
  };

  const shareBoard = async (boardId: string): Promise<string> => {
    try {
      const response = await fetcher(`/api/workspace/boards/${boardId}/share`, {
        method: 'POST',
      });
      
      toast.success('Enlace de compartir generado');
      return response.shareUrl;
    } catch (err: any) {
      toast.error('Error al generar enlace de compartir');
      throw err;
    }
  };

  const getSharedBoards = async (): Promise<WorkspaceBoard[]> => {
    try {
      const response = await fetcher('/api/workspace/boards/shared');
      return response.boards;
    } catch (err: any) {
      toast.error('Error al cargar pizarras compartidas');
      throw err;
    }
  };

  const loadStats = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetcher('/api/workspace/stats');
      setStats(response.stats);
    } catch (err: any) {
      console.error('Error loading workspace stats:', err);
    }
  }, [session?.user?.id]);

  // Load boards on mount and session change
  useEffect(() => {
    if (session?.user?.id) {
      loadBoards();
      loadStats();
    }
  }, [session?.user?.id, loadBoards, loadStats]);

  return {
    // State
    boards,
    currentBoard,
    stats,
    isLoading,
    error,
    
    // Board operations
    loadBoards,
    createBoard,
    updateBoard,
    deleteBoard,
    duplicateBoard,
    setCurrentBoard,
    
    // Block operations
    createBlock,
    updateBlock,
    deleteBlock,
    duplicateBlock,
    
    // Collaboration
    inviteCollaborator,
    removeCollaborator,
    updateCollaboratorRole,
    
    // Sharing
    shareBoard,
    getSharedBoards,
    
    // Stats
    loadStats,
  };
}