// Tipos para el sistema de gamificación

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  level: number
  xp: number
  totalXp: number
  crolars: number
  badges: Badge[]
  achievements: Achievement[]
  streak: {
    current: number
    longest: number
    lastActivity: string
  }
  stats: UserStats
}

export interface UserStats {
  coursesCompleted: number
  challengesCompleted: number
  forumAnswers: number
  notesUploaded: number
  eventsAttended: number
  clubsJoined: number
  friendsCount: number
  totalStudyTime: number // en minutos
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  category: 'learning' | 'social' | 'streak' | 'challenge' | 'milestone' | 'special'
  earnedAt?: string
  progress?: number
  maxProgress?: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'learning' | 'social' | 'streak' | 'challenge' | 'milestone'
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary'
  points: number
  earned: boolean
  earnedDate?: string
  progress?: number
  maxProgress?: number
  requirements?: string[]
  reward: {
    xp: number
    crolars: number
    badge?: string
  }
}

export interface Level {
  level: number
  name: string
  minXp: number
  maxXp: number
  rewards: {
    crolars: number
    badges?: string[]
  }
  perks?: string[]
}

export interface XPGain {
  id: string
  userId: string
  amount: number
  source: 'course' | 'challenge' | 'forum' | 'notes' | 'event' | 'club' | 'streak' | 'achievement'
  sourceId: string
  description: string
  timestamp: string
}

export interface Leaderboard {
  period: 'daily' | 'weekly' | 'monthly' | 'all-time'
  category: 'xp' | 'level' | 'crolars' | 'achievements' | 'streak'
  users: LeaderboardEntry[]
}

export interface LeaderboardEntry {
  rank: number
  user: {
    id: string
    name: string
    avatar?: string
    level: number
  }
  value: number
  change?: number // cambio desde el período anterior
}

export interface Notification {
  id: string
  userId: string
  type: 'xp_gain' | 'level_up' | 'badge_earned' | 'achievement_unlocked' | 'streak_milestone'
  title: string
  message: string
  data?: any
  read: boolean
  createdAt: string
}