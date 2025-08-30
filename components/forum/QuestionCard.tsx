"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageCircle, 
  Eye, 
  ThumbsUp, 
  Clock, 
  Award, 
  CheckCircle,
  Star,
  TrendingUp
} from "lucide-react";

interface Author {
  id: string;
  name: string;
  avatar: string;
  level: string;
  points: number;
}

interface Question {
  id: string;
  title: string;
  content: string;
  author: Author;
  subject: string;
  career: string;
  tags: string[];
  votes: number;
  answers: number;
  views: number;
  createdAt: Date;
  hasAcceptedAnswer: boolean;
  bounty: number;
}

interface QuestionCardProps {
  question: Question;
  onClick: () => void;
}

export function QuestionCard({ question, onClick }: QuestionCardProps) {
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'hace unos segundos';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `hace ${days} día${days > 1 ? 's' : ''}`;
    }
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'Matemáticas': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Física': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Química': return 'bg-green-100 text-green-800 border-green-200';
      case 'Biología': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Historia': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Literatura': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'Inglés': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Cálculo': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Principiante': return 'text-green-600';
      case 'Intermedio': return 'text-yellow-600';
      case 'Avanzado': return 'text-orange-600';
      case 'Experto': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white border border-gray-200 hover:border-purple-300"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 hover:text-purple-600 transition-colors">
                {question.title}
              </h3>
              <p className="text-gray-600 mt-2 line-clamp-2">
                {question.content}
              </p>
            </div>
            
            {/* Status indicators */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {question.hasAcceptedAnswer && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs font-medium">Resuelto</span>
                </div>
              )}
              {question.bounty > 0 && (
                <div className="flex items-center gap-1 text-yellow-600">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-xs font-medium">{question.bounty}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <Badge className={`text-xs ${getSubjectColor(question.subject)}`}>
              {question.subject}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {question.career}
            </Badge>
            {question.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {question.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{question.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4" />
                <span>{question.votes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>{question.answers}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{question.views}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{formatTimeAgo(question.createdAt)}</span>
            </div>
          </div>

          {/* Author */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={question.author.avatar} alt={question.author.name} />
                <AvatarFallback>
                  {question.author.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {question.author.name}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`font-medium ${getLevelColor(question.author.level)}`}>
                    {question.author.level}
                  </span>
                  <span className="text-gray-500">•</span>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Award className="h-3 w-3" />
                    <span>{question.author.points} pts</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Trending indicator */}
            {question.votes > 10 && (
              <div className="flex items-center gap-1 text-orange-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium">Trending</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}