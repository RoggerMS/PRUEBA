import { User, Level, XPGain, Badge, Achievement, Notification } from '@/types/gamification'
import { notificationService } from './notificationService'

// Configuración de niveles
export const LEVELS: Level[] = [
  { level: 1, name: 'Novato', minXp: 0, maxXp: 100, rewards: { crolars: 50 } },
  { level: 2, name: 'Aprendiz', minXp: 100, maxXp: 250, rewards: { crolars: 75 } },
  { level: 3, name: 'Estudiante', minXp: 250, maxXp: 500, rewards: { crolars: 100, badges: ['Primer Paso'] } },
  { level: 4, name: 'Dedicado', minXp: 500, maxXp: 850, rewards: { crolars: 125 } },
  { level: 5, name: 'Comprometido', minXp: 850, maxXp: 1300, rewards: { crolars: 150, badges: ['Constancia'] } },
  { level: 6, name: 'Avanzado', minXp: 1300, maxXp: 1850, rewards: { crolars: 200 } },
  { level: 7, name: 'Experto', minXp: 1850, maxXp: 2500, rewards: { crolars: 250 } },
  { level: 8, name: 'Maestro', minXp: 2500, maxXp: 3300, rewards: { crolars: 300, badges: ['Maestría'] } },
  { level: 9, name: 'Sabio', minXp: 3300, maxXp: 4250, rewards: { crolars: 400 } },
  { level: 10, name: 'Leyenda', minXp: 4250, maxXp: 5350, rewards: { crolars: 500, badges: ['Leyenda Académica'] } },
  { level: 11, name: 'Titán', minXp: 5350, maxXp: 6600, rewards: { crolars: 600 } },
  { level: 12, name: 'Inmortal', minXp: 6600, maxXp: 8100, rewards: { crolars: 750, badges: ['Inmortal del Saber'] } },
  { level: 13, name: 'Divino', minXp: 8100, maxXp: 10000, rewards: { crolars: 1000 } },
  { level: 14, name: 'Trascendente', minXp: 10000, maxXp: 12500, rewards: { crolars: 1250, badges: ['Trascendencia'] } },
  { level: 15, name: 'Omnisciente', minXp: 12500, maxXp: Infinity, rewards: { crolars: 1500, badges: ['Omnisciencia'] } }
]

// Configuración de XP por actividad
export const XP_REWARDS = {
  COURSE_LESSON_COMPLETE: 25,
  COURSE_COMPLETE: 200,
  CHALLENGE_COMPLETE: 100,
  FORUM_QUESTION: 15,
  FORUM_ANSWER: 20,
  FORUM_BEST_ANSWER: 50,
  NOTE_UPLOAD: 10,
  NOTE_SHARED: 5,
  EVENT_ATTEND: 30,
  CLUB_JOIN: 20,
  CLUB_POST: 10,
  DAILY_STREAK: 15,
  WEEKLY_STREAK: 100,
  MONTHLY_STREAK: 500,
  ACHIEVEMENT_UNLOCK: 50,
  BADGE_EARN: 25
}

class GamificationService {
  // Calcular nivel basado en XP
  calculateLevel(totalXp: number): Level {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (totalXp >= LEVELS[i].minXp) {
        return LEVELS[i]
      }
    }
    return LEVELS[0]
  }

  // Calcular XP necesario para el siguiente nivel
  getXpToNextLevel(currentXp: number): { needed: number; total: number } {
    const currentLevel = this.calculateLevel(currentXp)
    const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1)
    
    if (!nextLevel) {
      return { needed: 0, total: 0 }
    }
    
    return {
      needed: nextLevel.minXp - currentXp,
      total: nextLevel.minXp - currentLevel.minXp
    }
  }

  // Otorgar XP a un usuario
  async grantXP(
    userId: string, 
    amount: number, 
    source: XPGain['source'], 
    sourceId: string, 
    description: string
  ): Promise<{ levelUp: boolean; newLevel?: Level; notifications: Notification[] }> {
    // En una implementación real, esto interactuaría con la base de datos
    const user = await this.getUser(userId)
    const oldLevel = this.calculateLevel(user.totalXp)
    
    user.xp += amount
    user.totalXp += amount
    
    const newLevel = this.calculateLevel(user.totalXp)
    const levelUp = newLevel.level > oldLevel.level
    
    const notifications: Notification[] = []
    
    // Notificación de XP ganado
    notifications.push({
      id: `xp_${Date.now()}`,
      userId,
      type: 'xp_gain',
      title: `¡+${amount} XP ganados!`,
      message: `Has ganado ${amount} XP por ${description}`,
      data: { amount, source, sourceId },
      read: false,
      createdAt: new Date().toISOString()
    })
    
    // Enviar notificación usando el servicio
    await notificationService.notifyXPGained(amount, description)
    
    // Si subió de nivel, enviar notificación de nivel
    if (levelUp) {
      notificationService.notifyLevelUp(newLevel.level)
    }
    
    // Si subió de nivel
    if (levelUp) {
      user.level = newLevel.level
      user.crolars += newLevel.rewards.crolars
      
      notifications.push({
        id: `level_${Date.now()}`,
        userId,
        type: 'level_up',
        title: '¡Subiste de Nivel!',
        message: `¡Felicidades! Ahora eres ${newLevel.name} (Nivel ${newLevel.level})`,
        data: { newLevel, rewards: newLevel.rewards },
        read: false,
        createdAt: new Date().toISOString()
      })
      
      // Otorgar badges de nivel si los hay
      if (newLevel.rewards.badges) {
        for (const badgeName of newLevel.rewards.badges) {
          const badge = await this.grantBadge(userId, badgeName)
          if (badge) {
            notifications.push({
              id: `badge_${Date.now()}_${badge.id}`,
              userId,
              type: 'badge_earned',
              title: '¡Nueva Insignia!',
              message: `Has desbloqueado la insignia: ${badge.name}`,
              data: { badge },
              read: false,
              createdAt: new Date().toISOString()
            })
          }
        }
      }
    }
    
    // Guardar cambios del usuario
    await this.updateUser(user)
    
    // Registrar ganancia de XP
    await this.logXPGain({
      id: `xp_${userId}_${Date.now()}`,
      userId,
      amount,
      source,
      sourceId,
      description,
      timestamp: new Date().toISOString()
    })
    
    return {
      levelUp,
      newLevel: levelUp ? newLevel : undefined,
      notifications
    }
  }

  // Otorgar badge a un usuario
  async grantBadge(userId: string, badgeName: string): Promise<Badge | null> {
    const user = await this.getUser(userId)
    
    // Verificar si ya tiene el badge
    if (user.badges.some(b => b.name === badgeName)) {
      return null
    }
    
    const badge = await this.getBadgeByName(badgeName)
    if (!badge) return null
    
    badge.earnedAt = new Date().toISOString()
    user.badges.push(badge)
    
    // Enviar notificación de badge obtenido
    notificationService.notifyBadgeEarned(badge.name);
    
    await this.updateUser(user)
    
    return badge
  }

  // Verificar y desbloquear logros
  async checkAchievements(userId: string): Promise<Achievement[]> {
    const user = await this.getUser(userId)
    const unlockedAchievements: Achievement[] = []
    
    // Obtener logros disponibles que el usuario no ha desbloqueado
    const availableAchievements = await this.getAvailableAchievements(userId)
    
    for (const achievement of availableAchievements) {
      if (this.checkAchievementRequirements(user, achievement)) {
        achievement.earned = true
        achievement.earnedDate = new Date().toISOString()
        
        // Otorgar recompensas del logro
        await this.grantXP(
          userId,
          achievement.reward.xp,
          'achievement',
          achievement.id,
          `Logro desbloqueado: ${achievement.title}`
        )
        
        user.crolars += achievement.reward.crolars
        
        if (achievement.reward.badge) {
          await this.grantBadge(userId, achievement.reward.badge)
        }
        
        unlockedAchievements.push(achievement)
      }
    }
    
    if (unlockedAchievements.length > 0) {
      await this.updateUser(user)
    }
    
    return unlockedAchievements
  }

  // Verificar requisitos de un logro
  private checkAchievementRequirements(user: User, achievement: Achievement): boolean {
    switch (achievement.id) {
      case 'first_course':
        return user.stats.coursesCompleted >= 1
      case 'course_master':
        return user.stats.coursesCompleted >= 10
      case 'challenge_warrior':
        return user.stats.challengesCompleted >= 5
      case 'forum_helper':
        return user.stats.forumAnswers >= 10
      case 'streak_keeper':
        return user.streak.current >= 7
      case 'social_butterfly':
        return user.stats.friendsCount >= 20
      case 'knowledge_sharer':
        return user.stats.notesUploaded >= 50
      case 'event_enthusiast':
        return user.stats.eventsAttended >= 5
      case 'club_leader':
        return user.stats.clubsJoined >= 3
      case 'study_marathon':
        return user.stats.totalStudyTime >= 1000 // 1000 minutos
      default:
        return false
    }
  }

  // Actualizar racha diaria
  async updateDailyStreak(userId: string): Promise<{ streakUpdated: boolean; notifications: Notification[] }> {
    const user = await this.getUser(userId)
    const today = new Date().toDateString()
    const lastActivity = new Date(user.streak.lastActivity).toDateString()
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
    
    const notifications: Notification[] = []
    
    if (lastActivity === today) {
      // Ya registró actividad hoy
      return { streakUpdated: false, notifications }
    }
    
    if (lastActivity === yesterday) {
      // Continúa la racha
      user.streak.current += 1
      user.streak.lastActivity = new Date().toISOString()
      
      if (user.streak.current > user.streak.longest) {
        user.streak.longest = user.streak.current
      }
      
      // Otorgar XP por racha
      let xpReward = XP_REWARDS.DAILY_STREAK
      if (user.streak.current % 7 === 0) {
        xpReward = XP_REWARDS.WEEKLY_STREAK
      } else if (user.streak.current % 30 === 0) {
        xpReward = XP_REWARDS.MONTHLY_STREAK
      }
      
      const xpResult = await this.grantXP(
        userId,
        xpReward,
        'streak',
        'daily',
        `Racha de ${user.streak.current} días`
      )
      
      notifications.push(...xpResult.notifications)
      
      // Notificación de racha
      if (user.streak.current % 7 === 0) {
        notifications.push({
          id: `streak_${Date.now()}`,
          userId,
          type: 'streak_milestone',
          title: '¡Racha Semanal!',
          message: `¡Increíble! Has mantenido una racha de ${user.streak.current} días`,
          data: { streak: user.streak.current },
          read: false,
          createdAt: new Date().toISOString()
        })
      }
    } else {
      // Se rompió la racha
      user.streak.current = 1
      user.streak.lastActivity = new Date().toISOString()
    }
    
    await this.updateUser(user)
    
    return { streakUpdated: true, notifications }
  }

  // Métodos auxiliares (en una implementación real, estos interactuarían con la base de datos)
  private async getUser(userId: string): Promise<User> {
    // Implementación mock - en producción vendría de la base de datos
    throw new Error('Method not implemented - requires database integration')
  }

  private async updateUser(user: User): Promise<void> {
    // Implementación mock - en producción actualizaría la base de datos
    throw new Error('Method not implemented - requires database integration')
  }

  private async logXPGain(xpGain: XPGain): Promise<void> {
    // Implementación mock - en producción guardaría en la base de datos
    throw new Error('Method not implemented - requires database integration')
  }

  private async getBadgeByName(name: string): Promise<Badge | null> {
    // Implementación mock - en producción vendría de la base de datos
    throw new Error('Method not implemented - requires database integration')
  }

  private async getAvailableAchievements(userId: string): Promise<Achievement[]> {
    // Implementación mock - en producción vendría de la base de datos
    throw new Error('Method not implemented - requires database integration')
  }
}

export const gamificationService = new GamificationService()

// Exportar funciones de utilidad
export const calculateUserLevel = (totalXp: number): Level => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVELS[i].minXp) {
      return LEVELS[i]
    }
  }
  return LEVELS[0]
}

export const getXpToNextLevel = (currentXp: number): { needed: number; total: number } => {
  const currentLevel = calculateUserLevel(currentXp)
  const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1)
  
  if (!nextLevel) {
    return { needed: 0, total: 0 }
  }
  
  return {
    needed: nextLevel.minXp - currentXp,
    total: nextLevel.minXp - currentLevel.minXp
  }
}