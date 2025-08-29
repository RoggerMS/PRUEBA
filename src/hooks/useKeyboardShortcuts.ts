'use client';

import { useEffect, useCallback } from 'react';
import { useFeedStore, useKeyboard, useFeedActions, useComposerActions } from '@/store/feedStore';
import { useFireReaction } from './useFeed';
import { toast } from 'sonner';

interface UseKeyboardShortcutsOptions {
  onNavigateUp?: () => void;
  onNavigateDown?: () => void;
  onFire?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onSave?: (postId: string) => void;
  onCompose?: () => void;
  onRefresh?: () => void;
  selectedPostId?: string | null;
  disabled?: boolean;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const keyboard = useKeyboard();
  const { setSelectedPostId, trackEvent } = useFeedActions();
  const { setComposerOpen } = useComposerActions();
  const fireReaction = useFireReaction();

  const {
    onNavigateUp,
    onNavigateDown,
    onFire,
    onComment,
    onShare,
    onSave,
    onCompose,
    onRefresh,
    selectedPostId,
    disabled = false
  } = options;

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Don't handle shortcuts if disabled or keyboard shortcuts are disabled
    if (disabled || !keyboard.enabled) return;

    // Don't handle shortcuts when user is typing in input fields
    const target = event.target as HTMLElement;
    const isInputField = target.tagName === 'INPUT' || 
                        target.tagName === 'TEXTAREA' || 
                        target.contentEditable === 'true' ||
                        target.closest('[contenteditable="true"]');
    
    if (isInputField) return;

    // Don't handle shortcuts when modifiers are pressed (except Ctrl+R for refresh)
    if (event.altKey || event.metaKey || (event.ctrlKey && event.key !== 'r')) return;

    const key = event.key.toLowerCase();
    const { shortcuts } = keyboard;

    // Handle navigation shortcuts
    if (key === shortcuts.navigateUp && onNavigateUp) {
      event.preventDefault();
      onNavigateUp();
      trackEvent('keyboard_navigate', { direction: 'up' });
      return;
    }

    if (key === shortcuts.navigateDown && onNavigateDown) {
      event.preventDefault();
      onNavigateDown();
      trackEvent('keyboard_navigate', { direction: 'down' });
      return;
    }

    // Handle refresh (Ctrl+R or just R)
    if ((key === shortcuts.refresh && !event.ctrlKey) || 
        (event.ctrlKey && key === 'r' && onRefresh)) {
      event.preventDefault();
      onRefresh?.();
      trackEvent('keyboard_refresh');
      toast.success('Actualizando feed...');
      return;
    }

    // Handle compose shortcut
    if (key === shortcuts.compose && onCompose) {
      event.preventDefault();
      onCompose();
      trackEvent('keyboard_compose');
      return;
    }

    // Handle compose shortcut (fallback to opening composer)
    if (key === shortcuts.compose && !onCompose) {
      event.preventDefault();
      setComposerOpen(true);
      trackEvent('keyboard_compose');
      return;
    }

    // Post-specific shortcuts (require selected post)
    if (!selectedPostId) return;

    if (key === shortcuts.fire && onFire) {
      event.preventDefault();
      onFire(selectedPostId);
      trackEvent('keyboard_fire', { postId: selectedPostId });
      return;
    }

    // Fire reaction fallback using mutation
    if (key === shortcuts.fire && !onFire) {
      event.preventDefault();
      fireReaction.mutate(selectedPostId);
      trackEvent('keyboard_fire', { postId: selectedPostId });
      return;
    }

    if (key === shortcuts.comment && onComment) {
      event.preventDefault();
      onComment(selectedPostId);
      trackEvent('keyboard_comment', { postId: selectedPostId });
      return;
    }

    if (key === shortcuts.share && onShare) {
      event.preventDefault();
      onShare(selectedPostId);
      trackEvent('keyboard_share', { postId: selectedPostId });
      return;
    }

    if (key === shortcuts.save && onSave) {
      event.preventDefault();
      onSave(selectedPostId);
      trackEvent('keyboard_save', { postId: selectedPostId });
      return;
    }
  }, [
    disabled,
    keyboard,
    selectedPostId,
    onNavigateUp,
    onNavigateDown,
    onFire,
    onComment,
    onShare,
    onSave,
    onCompose,
    onRefresh,
    setComposerOpen,
    fireReaction,
    trackEvent
  ]);

  useEffect(() => {
    if (disabled || !keyboard.enabled) return;

    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress, disabled, keyboard.enabled]);

  // Return current shortcuts for display purposes
  return {
    shortcuts: keyboard.shortcuts,
    enabled: keyboard.enabled && !disabled,
    getShortcutDisplay: (action: keyof typeof keyboard.shortcuts) => {
      const key = keyboard.shortcuts[action];
      if (action === 'refresh') {
        return 'Ctrl+R or R';
      }
      return key.toUpperCase();
    }
  };
}

// Hook for post navigation within a list
export function usePostNavigation(postIds: string[]) {
  const { setSelectedPostId } = useFeedActions();
  const selectedPostId = useFeedStore((state) => state.selectedPostId);

  const navigateUp = useCallback(() => {
    if (!postIds.length) return;
    
    const currentIndex = selectedPostId ? postIds.indexOf(selectedPostId) : -1;
    const newIndex = currentIndex <= 0 ? postIds.length - 1 : currentIndex - 1;
    
    setSelectedPostId(postIds[newIndex]);
    
    // Scroll to post
    const postElement = document.getElementById(`post-${postIds[newIndex]}`);
    if (postElement) {
      postElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, [postIds, selectedPostId, setSelectedPostId]);

  const navigateDown = useCallback(() => {
    if (!postIds.length) return;
    
    const currentIndex = selectedPostId ? postIds.indexOf(selectedPostId) : -1;
    const newIndex = currentIndex >= postIds.length - 1 ? 0 : currentIndex + 1;
    
    setSelectedPostId(postIds[newIndex]);
    
    // Scroll to post
    const postElement = document.getElementById(`post-${postIds[newIndex]}`);
    if (postElement) {
      postElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, [postIds, selectedPostId, setSelectedPostId]);

  return {
    navigateUp,
    navigateDown,
    selectedPostId
  };
}

// Hook for composer shortcuts
export function useComposerShortcuts() {
  const { setComposerOpen } = useComposerActions();
  const { trackEvent } = useFeedActions();

  const openComposer = useCallback(() => {
    setComposerOpen(true);
    trackEvent('composer_opened', { trigger: 'keyboard' });
  }, [setComposerOpen, trackEvent]);

  return {
    openComposer
  };
}

// Hook for displaying keyboard shortcuts help
export function useShortcutsHelp() {
  const keyboard = useKeyboard();

  const shortcuts = [
    {
      category: 'Navegación',
      items: [
        {
          key: keyboard.shortcuts.navigateUp.toUpperCase(),
          description: 'Navegar hacia arriba'
        },
        {
          key: keyboard.shortcuts.navigateDown.toUpperCase(),
          description: 'Navegar hacia abajo'
        },
        {
          key: 'Ctrl+R o R',
          description: 'Actualizar feed'
        }
      ]
    },
    {
      category: 'Acciones',
      items: [
        {
          key: keyboard.shortcuts.fire.toUpperCase(),
          description: 'Dar fuego 🔥'
        },
        {
          key: keyboard.shortcuts.comment.toUpperCase(),
          description: 'Comentar'
        },
        {
          key: keyboard.shortcuts.share.toUpperCase(),
          description: 'Compartir'
        },
        {
          key: keyboard.shortcuts.save.toUpperCase(),
          description: 'Guardar'
        }
      ]
    },
    {
      category: 'Crear',
      items: [
        {
          key: keyboard.shortcuts.compose.toUpperCase(),
          description: 'Nuevo post'
        }
      ]
    }
  ];

  return {
    shortcuts,
    enabled: keyboard.enabled
  };
}