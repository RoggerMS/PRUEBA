'use client';

import { useState } from 'react';
import { Flame, Coins, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface StreakDay {
  day: number;
  completed: boolean;
  reward: number;
  claimed: boolean;
}

const streakDays: StreakDay[] = [
  { day: 1, completed: true, reward: 1, claimed: true },
  { day: 2, completed: true, reward: 2, claimed: true },
  { day: 3, completed: true, reward: 3, claimed: true },
  { day: 4, completed: true, reward: 4, claimed: true },
  { day: 5, completed: true, reward: 5, claimed: false }, // Can claim today
  { day: 6, completed: false, reward: 7, claimed: false },
  { day: 7, completed: false, reward: 10, claimed: false },
];

export function WeeklyStreak() {
  const [days, setDays] = useState(streakDays);
  const [isLoading, setIsLoading] = useState(false);

  const currentDay = days.find(day => day.completed && !day.claimed);
  const completedDays = days.filter(day => day.completed).length;
  const totalRewards = days.filter(day => day.claimed).reduce((sum, day) => sum + day.reward, 0);

  const handleClaimReward = async () => {
    if (!currentDay || isLoading) return;

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setDays(prev => prev.map(day => 
      day.day === currentDay.day 
        ? { ...day, claimed: true }
        : day
    ));
    
    toast.success(`¡${currentDay.reward} Crolars reclamados!`, {
      description: `Has completado el día ${currentDay.day} de tu racha semanal.`
    });
    
    setIsLoading(false);
  };

  return (
    <Card className="mb-6 bg-gradient-to-br from-fire/5 to-fire/10 border-fire/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
          <Flame className="w-5 h-5 text-fire" />
          <span>Racha Semanal</span>
          <Badge className="bg-fire text-white">
            {completedDays}/7
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progreso semanal</span>
            <span>{Math.round((completedDays / 7) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-fire to-fire/80 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(completedDays / 7) * 100}%` }}
            />
          </div>
        </div>

        {/* Streak Days */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {days.map((day) => (
            <div key={day.day} className="text-center">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium mb-1 transition-all',
                day.completed && day.claimed
                  ? 'bg-fire text-white'
                  : day.completed && !day.claimed
                  ? 'bg-fire/80 text-white animate-pulse'
                  : 'bg-gray-200 text-gray-500'
              )}>
                {day.completed ? (
                  <Flame className="w-3 h-3" />
                ) : (
                  day.day
                )}
              </div>
              <div className="text-xs text-gray-600">
                {day.reward}
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center mb-4 p-3 bg-white/50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Coins className="w-4 h-4 text-crolars" />
              <span className="font-bold text-crolars">{totalRewards}</span>
            </div>
            <p className="text-xs text-gray-600">Ganados</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Calendar className="w-4 h-4 text-fire" />
              <span className="font-bold text-fire">{completedDays}</span>
            </div>
            <p className="text-xs text-gray-600">Días</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Flame className="w-4 h-4 text-fire" />
              <span className="font-bold text-fire">{completedDays}</span>
            </div>
            <p className="text-xs text-gray-600">Racha</p>
          </div>
        </div>

        {/* Claim Button */}
        {currentDay && (
          <Button 
            onClick={handleClaimReward}
            disabled={isLoading}
            className="w-full bg-fire hover:bg-fire/90 text-white font-medium"
          >
            {isLoading ? (
              'Reclamando...'
            ) : (
              <>
                <Coins className="w-4 h-4 mr-2" />
                Reclamar {currentDay.reward} Crolars
              </>
            )}
          </Button>
        )}

        {!currentDay && completedDays < 7 && (
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              ¡Sigue participando para mantener tu racha!
            </p>
          </div>
        )}

        {completedDays === 7 && (
          <div className="text-center p-3 bg-gradient-to-r from-fire/10 to-fire/5 rounded-lg border border-fire/20">
            <p className="text-sm font-medium text-fire">
              ¡Felicidades! Completaste la racha semanal 🎉
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
