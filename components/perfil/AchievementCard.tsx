'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Award, Crown, CheckCircle } from 'lucide-react';

interface AchievementData {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  difficulty: string;
  points: number;
  earned: boolean;
  earnedAt?: string;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  reward: string;
}

interface AchievementCardProps {
  achievement: AchievementData;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'fácil':
      return 'bg-green-100 text-green-800';
    case 'medio':
      return 'bg-yellow-100 text-yellow-800';
    case 'difícil':
      return 'bg-red-100 text-red-800';
    case 'legendario':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'uncommon':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'rare':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'legendary':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getRarityIcon = (rarity: string) => {
  switch (rarity) {
    case 'common':
      return Trophy;
    case 'uncommon':
      return Star;
    case 'rare':
      return Award;
    case 'legendary':
      return Crown;
    default:
      return Trophy;
  }
};

export default function AchievementCard({ achievement }: AchievementCardProps) {
  const RarityIcon = getRarityIcon(achievement.rarity);
  const progressPercentage = achievement.progress && achievement.maxProgress 
    ? (achievement.progress / achievement.maxProgress) * 100 
    : 0;

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md ${
        achievement.earned 
          ? 'border-green-200 bg-green-50' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{achievement.icon}</div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {achievement.title}
                {achievement.earned && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="outline" 
                  className={getRarityColor(achievement.rarity)}
                >
                  <RarityIcon className="w-3 h-3 mr-1" />
                  {achievement.rarity}
                </Badge>
                <Badge 
                  variant="secondary" 
                  className={getDifficultyColor(achievement.difficulty)}
                >
                  {achievement.difficulty}
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600">
              {achievement.points} pts
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>
        
        {/* Progress bar for unearned achievements */}
        {!achievement.earned && achievement.progress !== undefined && achievement.maxProgress && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progreso</span>
              <span>{achievement.progress}/{achievement.maxProgress}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {achievement.category}
            </Badge>
          </div>
          {achievement.earned && achievement.earnedAt && (
            <span className="text-xs text-green-600">
              Obtenido: {new Date(achievement.earnedAt).toLocaleDateString()}
            </span>
          )}
        </div>
        
        <div className="mt-3 p-2 bg-gray-50 rounded-md">
          <p className="text-xs text-gray-600">
            <strong>Recompensa:</strong> {achievement.reward}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}