"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Heart, 
  Calendar, 
  Lock, 
  Globe, 
  Trophy,
  UserPlus,
  UserCheck,
  Eye
} from "lucide-react";
import { gamificationService } from "@/services/gamificationService";

interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  subject: string;
  memberCount: number;
  isPrivate: boolean;
  image: string;
  owner: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  tags: string[];
  level: string;
  createdAt: string;
  lastActivity: string;
  isJoined: boolean;
  achievements: Array<{
    name: string;
    icon: string;
  }>;
}

interface ClubCardProps {
  club: Club;
  onClick?: () => void;
}

export function ClubCard({ club, onClick }: ClubCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const wasLiked = isLiked;
    setIsLiked(!isLiked);
    
    // Grant XP for liking a club (only when liking, not unliking)
    if (!wasLiked) {
      try {
        gamificationService.grantXP("user-id", 2, "manual", "settings", 'Dar like a club');
      } catch (error) {
        console.error('Error granting XP for club like:', error);
      }
    }
  };

  const handleJoin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsJoining(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsJoining(false);
    
    // Grant XP for joining a club
    try {
      await gamificationService.grantXP("user-id", 10, "club", club.id, 'Unirse a club');
    } catch (error) {
      console.error('Error granting XP for joining club:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Académico":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Extracurricular":
        return "bg-green-100 text-green-700 border-green-200";
      case "Deportivo":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Arte":
        return "bg-pink-100 text-pink-700 border-pink-200";
      case "Tecnología":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Principiante":
        return "bg-green-100 text-green-700";
      case "Intermedio":
        return "bg-yellow-100 text-yellow-700";
      case "Avanzado":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 bg-white/90 backdrop-blur-sm border-0 shadow-lg overflow-hidden"
      onClick={onClick}
    >
      {/* Club Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={club.image} 
          alt={club.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Privacy Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={`${club.isPrivate ? 'bg-red-500' : 'bg-green-500'} text-white border-0`}>
            {club.isPrivate ? (
              <><Lock className="h-3 w-3 mr-1" /> Privado</>
            ) : (
              <><Globe className="h-3 w-3 mr-1" /> Público</>
            )}
          </Badge>
        </div>

        {/* Like Button */}
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-3 right-3 h-8 w-8 p-0 bg-white/20 backdrop-blur-sm hover:bg-white/30"
          onClick={handleLike}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
        </Button>

        {/* View Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button 
            size="sm" 
            className="bg-white/90 text-gray-800 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver Club
          </Button>
        </div>

        {/* Achievements */}
        {club.achievements.length > 0 && (
          <div className="absolute bottom-3 left-3 flex gap-1">
            {club.achievements.slice(0, 2).map((achievement, index) => (
              <div 
                key={index}
                className="bg-white/90 backdrop-blur-sm rounded-full p-1 text-xs"
                title={achievement.name}
              >
                {achievement.icon}
              </div>
            ))}
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Category and Level */}
        <div className="flex justify-between items-start">
          <Badge className={getCategoryColor(club.category)}>
            {club.category}
          </Badge>
          <Badge variant="outline" className={getLevelColor(club.level)}>
            {club.level}
          </Badge>
        </div>

        {/* Club Name */}
        <h3 className="font-bold text-lg text-gray-800 line-clamp-1 group-hover:text-purple-600 transition-colors">
          {club.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
          {club.description}
        </p>

        {/* Subject Badge */}
        <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
          {club.subject}
        </Badge>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {club.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs bg-gray-50">
              {tag}
            </Badge>
          ))}
          {club.tags.length > 3 && (
            <Badge variant="outline" className="text-xs bg-gray-50">
              +{club.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Owner Info */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <Avatar className="h-6 w-6">
            <AvatarImage src={club.owner.avatar} alt={club.owner.name} />
            <AvatarFallback className="text-xs">
              {club.owner.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-700 truncate">{club.owner.name}</p>
            <p className="text-xs text-gray-500">{club.owner.role}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{club.memberCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(club.lastActivity).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Join Button */}
        <div className="pt-2">
          {club.isJoined ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full border-green-200 text-green-700 hover:bg-green-50"
              disabled
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Miembro
            </Button>
          ) : (
            <Button 
              size="sm" 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              onClick={handleJoin}
              disabled={isJoining}
            >
              {isJoining ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Uniéndose...
                </div>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Unirse al Club
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
