'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FeedKind, FeedRanking, VisibilityLevel } from '@/types/feed';

interface ComposerState {
  isOpen: boolean;
  activeTab: FeedKind;
  text: string;
  media: File[];
  visibility: VisibilityLevel;
  hashtags: string[];
  isSubmitting: boolean;
}

interface UIState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  autoPlayVideos: boolean;
  showNotifications: boolean;
}

interface FeedPreferences {
  defaultRanking: FeedRanking;
  defaultVisibility: VisibilityLevel;
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
  postsPerPage: number;
}

interface KeyboardShortcuts {
  enabled: boolean;
  shortcuts: {
    navigateUp: string;
    navigateDown: string;
    fire: string;
    comment: string;
    share: string;
    save: string;
    compose: string;
    refresh: string;
  };
}

interface FeedStore {
  // Composer state
  composer: ComposerState;
  setComposerOpen: (isOpen: boolean) => void;
  setComposerTab: (tab: FeedKind) => void;
  setComposerText: (text: string) => void;
  setComposerMedia: (media: File[]) => void;
  addComposerMedia: (file: File) => void;
  removeComposerMedia: (index: number) => void;
  setComposerVisibility: (visibility: VisibilityLevel) => void;
  setComposerHashtags: (hashtags: string[]) => void;
  addComposerHashtag: (hashtag: string) => void;
  removeComposerHashtag: (hashtag: string) => void;
  setComposerSubmitting: (isSubmitting: boolean) => void;
  resetComposer: () => void;

  // UI state
  ui: UIState;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setCompactMode: (compact: boolean) => void;
  setAutoPlayVideos: (autoPlay: boolean) => void;
  setShowNotifications: (show: boolean) => void;

  // Feed preferences
  preferences: FeedPreferences;
  setDefaultRanking: (ranking: FeedRanking) => void;
  setDefaultVisibility: (visibility: VisibilityLevel) => void;
  setAutoRefresh: (autoRefresh: boolean) => void;
  setRefreshInterval: (interval: number) => void;
  setPostsPerPage: (count: number) => void;

  // Keyboard shortcuts
  keyboard: KeyboardShortcuts;
  setKeyboardEnabled: (enabled: boolean) => void;
  setShortcut: (action: keyof KeyboardShortcuts['shortcuts'], key: string) => void;

  // Current feed state
  currentRanking: FeedRanking;
  currentFilter: {
    kind?: FeedKind;
    author?: string;
    hashtag?: string;
  };
  setCurrentRanking: (ranking: FeedRanking) => void;
  setCurrentFilter: (filter: { kind?: FeedKind; author?: string; hashtag?: string }) => void;
  clearCurrentFilter: () => void;

  // Selected post for navigation
  selectedPostId: string | null;
  setSelectedPostId: (postId: string | null) => void;

  // Real-time updates
  realTimeEnabled: boolean;
  setRealTimeEnabled: (enabled: boolean) => void;

  // Analytics
  trackEvent: (event: string, data?: Record<string, any>) => void;
}

const initialComposerState: ComposerState = {
  isOpen: false,
  activeTab: 'post',
  text: '',
  media: [],
  visibility: 'public',
  hashtags: [],
  isSubmitting: false,
};

const initialUIState: UIState = {
  sidebarCollapsed: false,
  theme: 'system',
  compactMode: false,
  autoPlayVideos: true,
  showNotifications: true,
};

const initialPreferences: FeedPreferences = {
  defaultRanking: 'home',
  defaultVisibility: 'public',
  autoRefresh: true,
  refreshInterval: 30,
  postsPerPage: 10,
};

const initialKeyboardShortcuts: KeyboardShortcuts = {
  enabled: true,
  shortcuts: {
    navigateUp: 'k',
    navigateDown: 'j',
    fire: 'f',
    comment: 'c',
    share: 's',
    save: 'b',
    compose: 'n',
    refresh: 'r',
  },
};

export const useFeedStore = create<FeedStore>()(persist(
    (set, get) => ({
      // Composer state
      composer: initialComposerState,
      setComposerOpen: (isOpen) => 
        set((state) => ({ 
          composer: { ...state.composer, isOpen } 
        })),
      setComposerTab: (activeTab) => 
        set((state) => ({ 
          composer: { ...state.composer, activeTab } 
        })),
      setComposerText: (text) => 
        set((state) => ({ 
          composer: { ...state.composer, text } 
        })),
      setComposerMedia: (media) => 
        set((state) => ({ 
          composer: { ...state.composer, media } 
        })),
      addComposerMedia: (file) => 
        set((state) => ({ 
          composer: { 
            ...state.composer, 
            media: [...state.composer.media, file] 
          } 
        })),
      removeComposerMedia: (index) => 
        set((state) => ({ 
          composer: { 
            ...state.composer, 
            media: state.composer.media.filter((_, i) => i !== index) 
          } 
        })),
      setComposerVisibility: (visibility) => 
        set((state) => ({ 
          composer: { ...state.composer, visibility } 
        })),
      setComposerHashtags: (hashtags) => 
        set((state) => ({ 
          composer: { ...state.composer, hashtags } 
        })),
      addComposerHashtag: (hashtag) => 
        set((state) => ({ 
          composer: { 
            ...state.composer, 
            hashtags: [...new Set([...state.composer.hashtags, hashtag])] 
          } 
        })),
      removeComposerHashtag: (hashtag) => 
        set((state) => ({ 
          composer: { 
            ...state.composer, 
            hashtags: state.composer.hashtags.filter(h => h !== hashtag) 
          } 
        })),
      setComposerSubmitting: (isSubmitting) => 
        set((state) => ({ 
          composer: { ...state.composer, isSubmitting } 
        })),
      resetComposer: () => 
        set((state) => ({ 
          composer: { 
            ...initialComposerState, 
            visibility: state.preferences.defaultVisibility 
          } 
        })),

      // UI state
      ui: initialUIState,
      setSidebarCollapsed: (collapsed) => 
        set((state) => ({ 
          ui: { ...state.ui, sidebarCollapsed: collapsed } 
        })),
      setTheme: (theme) => 
        set((state) => ({ 
          ui: { ...state.ui, theme } 
        })),
      setCompactMode: (compact) => 
        set((state) => ({ 
          ui: { ...state.ui, compactMode: compact } 
        })),
      setAutoPlayVideos: (autoPlay) => 
        set((state) => ({ 
          ui: { ...state.ui, autoPlayVideos: autoPlay } 
        })),
      setShowNotifications: (show) => 
        set((state) => ({ 
          ui: { ...state.ui, showNotifications: show } 
        })),

      // Feed preferences
      preferences: initialPreferences,
      setDefaultRanking: (ranking) => 
        set((state) => ({ 
          preferences: { ...state.preferences, defaultRanking: ranking } 
        })),
      setDefaultVisibility: (visibility) => 
        set((state) => ({ 
          preferences: { ...state.preferences, defaultVisibility: visibility } 
        })),
      setAutoRefresh: (autoRefresh) => 
        set((state) => ({ 
          preferences: { ...state.preferences, autoRefresh } 
        })),
      setRefreshInterval: (interval) => 
        set((state) => ({ 
          preferences: { ...state.preferences, refreshInterval: interval } 
        })),
      setPostsPerPage: (count) => 
        set((state) => ({ 
          preferences: { ...state.preferences, postsPerPage: count } 
        })),

      // Keyboard shortcuts
      keyboard: initialKeyboardShortcuts,
      setKeyboardEnabled: (enabled) => 
        set((state) => ({ 
          keyboard: { ...state.keyboard, enabled } 
        })),
      setShortcut: (action, key) => 
        set((state) => ({ 
          keyboard: { 
            ...state.keyboard, 
            shortcuts: { ...state.keyboard.shortcuts, [action]: key } 
          } 
        })),

      // Current feed state
      currentRanking: 'home',
      currentFilter: {},
      setCurrentRanking: (ranking) => set({ currentRanking: ranking }),
      setCurrentFilter: (filter) => set({ currentFilter: filter }),
      clearCurrentFilter: () => set({ currentFilter: {} }),

      // Selected post for navigation
      selectedPostId: null,
      setSelectedPostId: (postId) => set({ selectedPostId: postId }),

      // Real-time updates
      realTimeEnabled: true,
      setRealTimeEnabled: (enabled) => set({ realTimeEnabled: enabled }),

      // Analytics
      trackEvent: (event, data = {}) => {
        // Track analytics events
        if (typeof window !== 'undefined') {
          // Send to analytics service
          console.log('Analytics Event:', event, data);
          
          // You can integrate with your analytics service here
          // Example: gtag('event', event, data);
          // Example: analytics.track(event, data);
        }
      },
    }),
    {
      name: 'crunevo-feed-store',
      partialize: (state) => ({
        ui: state.ui,
        preferences: state.preferences,
        keyboard: state.keyboard,
        realTimeEnabled: state.realTimeEnabled,
      }),
    }
  ));

// Selectors for better performance
export const useComposer = () => useFeedStore((state) => state.composer);
export const useComposerActions = () => {
  const setComposerOpen = useFeedStore((state) => state.setComposerOpen);
  const setComposerTab = useFeedStore((state) => state.setComposerTab);
  const setComposerText = useFeedStore((state) => state.setComposerText);
  const setComposerMedia = useFeedStore((state) => state.setComposerMedia);
  const addComposerMedia = useFeedStore((state) => state.addComposerMedia);
  const removeComposerMedia = useFeedStore((state) => state.removeComposerMedia);
  const setComposerVisibility = useFeedStore((state) => state.setComposerVisibility);
  const setComposerHashtags = useFeedStore((state) => state.setComposerHashtags);
  const addComposerHashtag = useFeedStore((state) => state.addComposerHashtag);
  const removeComposerHashtag = useFeedStore((state) => state.removeComposerHashtag);
  const setComposerSubmitting = useFeedStore((state) => state.setComposerSubmitting);
  const resetComposer = useFeedStore((state) => state.resetComposer);

  return {
    setComposerOpen,
    setComposerTab,
    setComposerText,
    setComposerMedia,
    addComposerMedia,
    removeComposerMedia,
    setComposerVisibility,
    setComposerHashtags,
    addComposerHashtag,
    removeComposerHashtag,
    setComposerSubmitting,
    resetComposer,
  };
};

export const useUI = () => useFeedStore((state) => state.ui);
export const useUIActions = () => {
  const setSidebarCollapsed = useFeedStore((state) => state.setSidebarCollapsed);
  const setTheme = useFeedStore((state) => state.setTheme);
  const setCompactMode = useFeedStore((state) => state.setCompactMode);
  const setAutoPlayVideos = useFeedStore((state) => state.setAutoPlayVideos);
  const setShowNotifications = useFeedStore((state) => state.setShowNotifications);

  return {
    setSidebarCollapsed,
    setTheme,
    setCompactMode,
    setAutoPlayVideos,
    setShowNotifications,
  };
};

export const usePreferences = () => useFeedStore((state) => state.preferences);
export const useKeyboard = () => useFeedStore((state) => state.keyboard);
export const useCurrentFeed = () => {
  const ranking = useFeedStore((state) => state.currentRanking);
  const filter = useFeedStore((state) => state.currentFilter);
  const selectedPostId = useFeedStore((state) => state.selectedPostId);

  return { ranking, filter, selectedPostId };
};

export const useFeedActions = () => {
  const setCurrentRanking = useFeedStore((state) => state.setCurrentRanking);
  const setCurrentFilter = useFeedStore((state) => state.setCurrentFilter);
  const clearCurrentFilter = useFeedStore((state) => state.clearCurrentFilter);
  const setSelectedPostId = useFeedStore((state) => state.setSelectedPostId);
  const trackEvent = useFeedStore((state) => state.trackEvent);

  return {
    setCurrentRanking,
    setCurrentFilter,
    clearCurrentFilter,
    setSelectedPostId,
    trackEvent,
  };
};
