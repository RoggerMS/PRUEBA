'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Award, Crown } from 'lucide-react';

interface BadgeData {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  category: string;
  earned: boolean;
  earnedAt?: string;
}

interface BadgeCollectionProps {
  badges: BadgeData[];
  showEarnedOnly?: boolean;
}

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

export default function BadgeCollection({ badges, showEarnedOnly = false }: BadgeCollectionProps) {
  const displayBadges = showEarnedOnly ? badges.filter(badge => badge.earned) : badges;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {displayBadges.map((badge) => {
        const RarityIcon = getRarityIcon(badge.rarity);
        
        return (
          <Card 
            key={badge.id} 
            className={`transition-all duration-200 hover:shadow-md ${
              badge.earned ? 'border-green-200 bg-green-50' : 'opacity-60'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="text-2xl">{badge.icon}</div>
                <Badge 
                  variant="outline" 
                  className={getRarityColor(badge.rarity)}
                >
                  <RarityIcon className="w-3 h-3 mr-1" />
                  {badge.rarity}
                </Badge>
              </div>
              <CardTitle className="text-lg">{badge.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {badge.category}
                </Badge>
                {badge.earned && badge.earnedAt && (
                  <span className="text-xs text-green-600">
                    Obtenido: {new Date(badge.earnedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}