// CRUNEVO Feed System Types

export type FeedKind = 'post' | 'photo' | 'video' | 'question' | 'note';

export type VisibilityLevel = 'public' | 'university' | 'friends' | 'private';

export interface UserLite {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  verified?: boolean;
}

export interface Media {
  id: string;
  type: 'image' | 'video' | 'document';
  url: string;
  thumbnail?: string;
  filename?: string;
  name?: string;
  size?: number;
  duration?: number; // for videos in seconds
  width?: number;
  height?: number;
}

export interface FeedPost {
  id: string;
  kind: FeedKind;
  author: UserLite;
  createdAt: string;
  updatedAt?: string;
  text?: string;
  title?: string; // for questions and notes
  media?: Media[];
  visibility: VisibilityLevel;
  hashtags?: string[];
  mentions?: UserLite[];
  stats: {
    fires: number;
    comments: number;
    shares: number;
    saves: number;
    views: number;
  };
  viewerState: {
    fired: boolean;
    saved: boolean;
    shared: boolean;
  };
  // For shared posts
  originalPost?: {
    id: string;
    author: UserLite;
    text?: string;
    createdAt: string;
  };
  shareComment?: string;
}

export interface Comment {
  id: string;
  postId: string;
  author: UserLite;
  text: string;
  createdAt: string;
  updatedAt?: string;
  parentId?: string; // for nested comments
  stats: {
    fires: number;
    replies: number;
  };
  viewerState: {
    fired: boolean;
  };
  replies?: Comment[]; // nested replies
}

export interface FeedResponse {
  posts: FeedPost[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface CreatePostData {
  kind: FeedKind;
  text?: string;
  title?: string;
  media?: File[];
  visibility: VisibilityLevel;
  hashtags?: string[];
}

export interface CreateCommentData {
  postId: string;
  text: string;
  parentId?: string;
}

export interface SharePostData {
  postId: string;
  comment?: string;
  visibility: VisibilityLevel;
}

export type FeedRanking = 'home' | 'recent' | 'saved' | 'trending';

export interface FeedFilters {
  ranking: FeedRanking;
  kind?: FeedKind;
  author?: string;
  hashtag?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface NotificationEvent {
  type: 'fire' | 'comment' | 'share' | 'mention' | 'follow';
  postId?: string;
  commentId?: string;
  actor: UserLite;
  createdAt: string;
}

// Analytics events
export interface AnalyticsEvent {
  type: 'impression' | 'fire_click' | 'comment_submit' | 'share' | 'save' | 'media_view';
  postId: string;
  userId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

// Keyboard shortcuts
export type KeyboardShortcut = {
  key: string;
  action: 'navigate_up' | 'navigate_down' | 'fire' | 'comment' | 'share' | 'save';
  description: string;
};

export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  { key: 'j', action: 'navigate_down', description: 'Navigate to next post' },
  { key: 'k', action: 'navigate_up', description: 'Navigate to previous post' },
  { key: 'f', action: 'fire', description: 'Fire reaction' },
  { key: 'c', action: 'comment', description: 'Focus comment input' },
  { key: 's', action: 'share', description: 'Share post' },
  { key: 'b', action: 'save', description: 'Save/bookmark post' },
];