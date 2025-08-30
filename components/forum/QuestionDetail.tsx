"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Eye, 
  Clock, 
  Award, 
  CheckCircle,
  Star,
  Share2,
  Bookmark,
  Flag,
  Edit,
  MoreHorizontal,
  Send,
  Reply,
  Heart
} from "lucide-react";
import { toast } from "sonner";

interface Author {
  id: string;
  name: string;
  avatar: string;
  level: string;
  points: number;
}

interface Answer {
  id: string;
  content: string;
  author: Author;
  votes: number;
  createdAt: Date;
  isAccepted: boolean;
  comments: Comment[];
}

interface Comment {
  id: string;
  content: string;
  author: Author;
  createdAt: Date;
  votes: number;
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

interface QuestionDetailProps {
  question: Question;
  onBack: () => void;
}

export function QuestionDetail({ question, onBack }: QuestionDetailProps) {
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [newAnswer, setNewAnswer] = useState("");
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});

  // Mock answers data
  const [answers, setAnswers] = useState<Answer[]>([
    {
      id: "1",
      content: "Esta es una respuesta detallada que explica el concepto paso a paso. Primero, necesitas entender que...",
      author: {
        id: "expert1",
        name: "Dr. María González",
        avatar: "/avatars/expert1.jpg",
        level: "Experto",
        points: 5420
      },
      votes: 15,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isAccepted: true,
      comments: [
        {
          id: "c1",
          content: "Excelente explicación, muy clara",
          author: {
            id: "student1",
            name: "Ana López",
            avatar: "/avatars/student1.jpg",
            level: "Intermedio",
            points: 890
          },
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          votes: 3
        }
      ]
    },
    {
      id: "2",
      content: "Otra perspectiva del problema sería considerar...",
      author: {
        id: "tutor1",
        name: "Carlos Ruiz",
        avatar: "/avatars/tutor1.jpg",
        level: "Avanzado",
        points: 3210
      },
      votes: 8,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      isAccepted: false,
      comments: []
    }
  ]);

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

  const handleVote = (type: 'up' | 'down') => {
    if (userVote === type) {
      setUserVote(null);
      toast.success("Voto removido");
    } else {
      setUserVote(type);
      toast.success(`Voto ${type === 'up' ? 'positivo' : 'negativo'} registrado`);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? "Pregunta removida de favoritos" : "Pregunta guardada en favoritos");
  };

  const handleSubmitAnswer = async () => {
    if (!newAnswer.trim()) {
      toast.error("Escribe una respuesta");
      return;
    }

    setIsSubmittingAnswer(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const answer: Answer = {
        id: Date.now().toString(),
        content: newAnswer,
        author: {
          id: "current-user",
          name: "Usuario Actual",
          avatar: "/avatars/current.jpg",
          level: "Intermedio",
          points: 1250
        },
        votes: 0,
        createdAt: new Date(),
        isAccepted: false,
        comments: []
      };
      
      setAnswers(prev => [...prev, answer]);
      setNewAnswer("");
      toast.success("Respuesta publicada exitosamente");
    } catch (error) {
      toast.error("Error al publicar la respuesta");
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleSubmitComment = async (answerId: string) => {
    const commentText = newComment[answerId];
    if (!commentText?.trim()) {
      toast.error("Escribe un comentario");
      return;
    }

    try {
      const comment: Comment = {
        id: Date.now().toString(),
        content: commentText,
        author: {
          id: "current-user",
          name: "Usuario Actual",
          avatar: "/avatars/current.jpg",
          level: "Intermedio",
          points: 1250
        },
        createdAt: new Date(),
        votes: 0
      };
      
      setAnswers(prev => prev.map(answer => 
        answer.id === answerId 
          ? { ...answer, comments: [...answer.comments, comment] }
          : answer
      ));
      
      setNewComment(prev => ({ ...prev, [answerId]: "" }));
      toast.success("Comentario agregado");
    } catch (error) {
      toast.error("Error al agregar comentario");
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={onBack} className="mb-4">
        ← Volver al foro
      </Button>

      {/* Question Card */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {question.title}
              </h1>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className={`text-xs ${getSubjectColor(question.subject)}`}>
                  {question.subject}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {question.career}
                </Badge>
                {question.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
                {question.bounty > 0 && (
                  <Badge className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    {question.bounty} Crolars
                  </Badge>
                )}
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{question.views} vistas</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{answers.length} respuestas</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatTimeAgo(question.createdAt)}</span>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleBookmark}>
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current text-yellow-600' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Question content */}
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {question.content}
            </p>
          </div>
          
          {/* Author and voting */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4">
              {/* Voting */}
              <div className="flex flex-col items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote('up')}
                  className={userVote === 'up' ? 'text-green-600 bg-green-50' : ''}
                >
                  <ThumbsUp className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium text-gray-700">
                  {question.votes + (userVote === 'up' ? 1 : userVote === 'down' ? -1 : 0)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote('down')}
                  className={userVote === 'down' ? 'text-red-600 bg-red-50' : ''}
                >
                  <ThumbsDown className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Author */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={question.author.avatar} alt={question.author.name} />
                  <AvatarFallback>
                    {question.author.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">
                    {question.author.name}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
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
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Flag className="h-4 w-4" />
                Reportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answers */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {answers.length} Respuesta{answers.length !== 1 ? 's' : ''}
        </h2>
        
        {answers.map((answer) => (
          <Card key={answer.id} className={`bg-white border ${answer.isAccepted ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}>
            <CardContent className="p-6">
              {answer.isAccepted && (
                <div className="flex items-center gap-2 mb-4 text-green-600">
                  <CheckCircle className="h-5 w-5 fill-current" />
                  <span className="font-medium">Respuesta aceptada</span>
                </div>
              )}
              
              <div className="prose max-w-none mb-4">
                <p className="text-gray-700 leading-relaxed">
                  {answer.content}
                </p>
              </div>
              
              {/* Answer footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  {/* Voting */}
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium text-gray-700">
                      {answer.votes}
                    </span>
                    <Button variant="ghost" size="sm">
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Actions */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowComments(prev => ({ ...prev, [answer.id]: !prev[answer.id] }))}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {answer.comments.length} comentarios
                  </Button>
                  
                  <Button variant="ghost" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {answer.author.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`font-medium ${getLevelColor(answer.author.level)}`}>
                        {answer.author.level}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-500">
                        {formatTimeAgo(answer.createdAt)}
                      </span>
                    </div>
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={answer.author.avatar} alt={answer.author.name} />
                    <AvatarFallback>
                      {answer.author.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              
              {/* Comments */}
              {showComments[answer.id] && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                  {answer.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                        <AvatarFallback className="text-xs">
                          {comment.author.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {comment.author.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add comment */}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Agregar un comentario..."
                      value={newComment[answer.id] || ""}
                      onChange={(e) => setNewComment(prev => ({ ...prev, [answer.id]: e.target.value }))}
                      className="min-h-[60px] text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSubmitComment(answer.id)}
                      disabled={!newComment[answer.id]?.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Answer */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">
            Tu Respuesta
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Escribe tu respuesta aquí. Sé claro y detallado para ayudar al usuario..."
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            className="min-h-[120px]"
          />
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {newAnswer.length}/1000 caracteres
            </p>
            
            <Button
              onClick={handleSubmitAnswer}
              disabled={!newAnswer.trim() || isSubmittingAnswer}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSubmittingAnswer ? "Publicando..." : "Publicar Respuesta"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}