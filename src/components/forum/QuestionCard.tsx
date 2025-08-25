'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  ArrowUp, 
  ArrowDown, 
  MessageCircle, 
  Eye, 
  Clock, 
  Award,
  Star,
  Coins
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

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
  const {
    title,
    content,
    author,
    subject,
    career,
    tags,
    votes,
    answers,
    views,
    createdAt,
    hasAcceptedAnswer,
    bounty
  } = question;

  const timeAgo = formatDistanceToNow(createdAt, { 
    addSuffix: true, 
    locale: es 
  });

  const getSubjectColor = (subject: string) => {
    const colors: { [key: string]: string } = {
      'Matemáticas': 'bg-blue-100 text-blue-800 border-blue-200',
      'Física': 'bg-green-100 text-green-800 border-green-200',
      'Química': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Biología': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Historia': 'bg-orange-100 text-orange-800 border-orange-200',
      'Literatura': 'bg-pink-100 text-pink-800 border-pink-200',
      'Inglés': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Cálculo': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[subject] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getCareerColor = (career: string) => {
    const colors: { [key: string]: string } = {
      'Ingeniería': 'bg-slate-100 text-slate-700',
      'Medicina': 'bg-red-100 text-red-700',
      'Derecho': 'bg-amber-100 text-amber-700',
      'Administración': 'bg-teal-100 text-teal-700',
      'Psicología': 'bg-violet-100 text-violet-700',
      'Educación': 'bg-cyan-100 text-cyan-700'
    };
    return colors[career] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Card 
      className="bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all duration-200 cursor-pointer border-l-4 border-l-purple-500 hover:border-l-blue-500 hover:shadow-lg"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Vote Section */}
          <div className="flex lg:flex-col items-center lg:items-start gap-2 lg:gap-1 lg:w-20">
            <div className="flex lg:flex-col items-center gap-1">
              <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                <ArrowUp className="w-4 h-4 text-gray-600" />
              </Button>
              <span className="font-bold text-lg text-gray-700">{votes}</span>
              <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                <ArrowDown className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
            
            {/* Stats */}
            <div className="flex lg:flex-col gap-3 lg:gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{answers}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{views}</span>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1">
            <div className="flex flex-wrap items-start gap-2 mb-3">
              <Badge className={getSubjectColor(subject)}>
                {subject}
              </Badge>
              <Badge variant="outline" className={getCareerColor(career)}>
                {career}
              </Badge>
              {hasAcceptedAnswer && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <Award className="w-3 h-3 mr-1" />
                  Resuelto
                </Badge>
              )}
              {bounty > 0 && (
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  <Coins className="w-3 h-3 mr-1" />
                  +{bounty} Crolars
                </Badge>
              )}
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-purple-600 transition-colors">
              {title}
            </h3>
            
            <p className="text-gray-600 mb-4 line-clamp-2">
              {content}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  #{tag}
                </Badge>
              ))}
            </div>

            {/* Author and Time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={author.avatar} alt={author.name} />
                  <AvatarFallback className="bg-purple-100 text-purple-600">
                    {author.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-900">{author.name}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{author.level}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span>{author.points}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{timeAgo}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
