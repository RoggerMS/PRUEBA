'use client';

import { useState } from 'react';
import { gamificationService } from '@/services/gamificationService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  ArrowUp, 
  ArrowDown, 
  MessageCircle, 
  Eye, 
  Clock, 
  Award,
  Star,
  Coins,
  Check,
  Flag,
  Share2,
  Bookmark,
  Edit,
  MoreHorizontal,
  LoaderIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { gamificationService } from '@/lib/gamification';
import { useQuestion, useAnswers, useCreateAnswer, useVoteQuestion, useVoteAnswer, useAcceptAnswer } from '@/hooks/useForum';

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
  isEdited: boolean;
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
  questionId: string;
  onBack: () => void;
}



export function QuestionDetail({ questionId, onBack }: QuestionDetailProps) {
  const [newAnswer, setNewAnswer] = useState('');
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  
  const { data: question, isLoading: questionLoading, error: questionError } = useQuestion(questionId);
  const { data: answers = [], isLoading: answersLoading, error: answersError } = useAnswers(questionId);
  const createAnswerMutation = useCreateAnswer(questionId);
  const voteQuestionMutation = useVoteQuestion();
  const voteAnswerMutation = useVoteAnswer();
  const acceptAnswerMutation = useAcceptAnswer();

  const handleVote = async (type: 'up' | 'down', answerId?: string) => {
    try {
      if (answerId) {
        await voteAnswerMutation.mutateAsync({ answerId, data: { type } });
        
        // Grant XP for voting on answer
        await gamificationService.grantXP(
          'current-user',
          2,
          'forum_vote',
          answerId,
          `Voto ${type === 'up' ? 'positivo' : 'negativo'} en respuesta`
        );
      } else {
        const newVote = userVote === type ? null : type;
        setUserVote(newVote);
        
        if (newVote) {
          await voteQuestionMutation.mutateAsync({ questionId, data: { type: newVote } });
        }
        
        // Grant XP for voting on question
        await gamificationService.grantXP(
          'current-user',
          2,
          'forum_vote',
          questionId,
          `Voto ${type === 'up' ? 'positivo' : 'negativo'} en pregunta`
        );
      }
      
      toast.success(`Voto ${type === 'up' ? 'positivo' : 'negativo'} registrado`);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    try {
      await acceptAnswerMutation.mutateAsync({ questionId, answerId });
      
      // Grant XP for accepting an answer
      const targetAnswer = answers.find(answer => answer.id === answerId);
      if (targetAnswer) {
        await gamificationService.grantXP(
          targetAnswer.author.id,
          25,
          'forum_accepted_answer',
          answerId,
          'Respuesta aceptada como correcta'
        );
      }
      
      toast.success('Respuesta marcada como aceptada');
    } catch (error) {
      console.error('Error accepting answer:', error);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!newAnswer.trim()) return;
    
    try {
      await createAnswerMutation.mutateAsync({ content: newAnswer });
      setNewAnswer('');
      
      // Grant XP for answering a question
      await gamificationService.grantXP(
        'current-user',
        15,
        'forum_answer',
        questionId,
        'Respuesta publicada en el foro'
      );
      
      toast.success('Respuesta enviada exitosamente');
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  if (questionLoading || answersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6 flex items-center justify-center">
        <LoaderIcon className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (questionError || answersError || !question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error al cargar la pregunta</p>
          <Button onClick={onBack}>Volver</Button>
        </div>
      </div>
    );
  }

  const timeAgo = formatDistanceToNow(question.createdAt, { 
    addSuffix: true, 
    locale: es 
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                {question.subject}
              </Badge>
              <Badge variant="outline" className="bg-slate-100 text-slate-700">
                {question.career}
              </Badge>
              {question.hasAcceptedAnswer && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <Award className="w-3 h-3 mr-1" />
                  Resuelto
                </Badge>
              )}
              {question.bounty > 0 && (
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  <Coins className="w-3 h-3 mr-1" />
                  +{question.bounty} Crolars
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{question.title}</h1>
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex gap-6">
              {/* Vote Section */}
              <div className="flex flex-col items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`p-2 ${userVote === 'up' ? 'text-green-600 bg-green-50' : 'text-gray-600'}`}
                  onClick={() => handleVote('up')}
                >
                  <ArrowUp className="w-5 h-5" />
                </Button>
                <span className="font-bold text-xl text-gray-700">{question.votes}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`p-2 ${userVote === 'down' ? 'text-red-600 bg-red-50' : 'text-gray-600'}`}
                  onClick={() => handleVote('down')}
                >
                  <ArrowDown className="w-5 h-5" />
                </Button>
                
                <div className="flex flex-col items-center gap-2 mt-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{question.views}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="p-1">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="prose max-w-none mb-6">
                  <p className="text-gray-700 whitespace-pre-line">{question.content}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {question.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>

                {/* Author and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={question.author.avatar} alt={question.author.name} />
                      <AvatarFallback className="bg-purple-100 text-purple-600">
                        {question.author.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">{question.author.name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{question.author.level}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span>{question.author.points}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{timeAgo}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Flag className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Answers Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {answers.length} {answers.length === 1 ? 'Respuesta' : 'Respuestas'}
          </h2>
          
          <div className="space-y-4">
            {answers.sort((a, b) => {
              if (a.isAccepted && !b.isAccepted) return -1;
              if (!a.isAccepted && b.isAccepted) return 1;
              return b.votes - a.votes;
            }).map(answer => {
              const answerTimeAgo = formatDistanceToNow(answer.createdAt, { 
                addSuffix: true, 
                locale: es 
              });
              
              return (
                <Card 
                  key={answer.id} 
                  className={`bg-white/70 backdrop-blur-sm ${
                    answer.isAccepted ? 'border-l-4 border-l-green-500 bg-green-50/30' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* Vote Section */}
                      <div className="flex flex-col items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-2 text-gray-600 hover:text-green-600"
                          onClick={() => handleVote('up', answer.id)}
                        >
                          <ArrowUp className="w-5 h-5" />
                        </Button>
                        <span className="font-bold text-lg text-gray-700">{answer.votes}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-2 text-gray-600 hover:text-red-600"
                          onClick={() => handleVote('down', answer.id)}
                        >
                          <ArrowDown className="w-5 h-5" />
                        </Button>
                        
                        {/* Accept Answer Button */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`p-2 mt-2 ${
                            answer.isAccepted 
                              ? 'text-green-600 bg-green-50' 
                              : 'text-gray-400 hover:text-green-600'
                          }`}
                          onClick={() => handleAcceptAnswer(answer.id)}
                        >
                          <Check className="w-5 h-5" />
                        </Button>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        {answer.isAccepted && (
                          <div className="flex items-center gap-2 mb-3">
                            <Award className="w-5 h-5 text-green-600" />
                            <span className="text-green-600 font-medium">Respuesta Aceptada</span>
                            {question.bounty > 0 && (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                <Coins className="w-3 h-3 mr-1" />
                                +{question.bounty} Crolars
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        <div className="prose max-w-none mb-4">
                          <p className="text-gray-700 whitespace-pre-line">{answer.content}</p>
                        </div>

                        {/* Author and Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={answer.author.avatar} alt={answer.author.name} />
                              <AvatarFallback className="bg-purple-100 text-purple-600">
                                {answer.author.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{answer.author.name}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{answer.author.level}</span>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-500" />
                                  <span>{answer.author.points}</span>
                                </div>
                                <span>•</span>
                                <span>{answerTimeAgo}</span>
                                {answer.isEdited && (
                                  <>
                                    <span>•</span>
                                    <span className="text-gray-400">editado</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Flag className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Add Answer */}
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-purple-600" />
              Tu Respuesta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Escribe tu respuesta aquí... Sé específico y proporciona ejemplos cuando sea posible."
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              rows={6}
              className="mb-4"
              disabled={createAnswerMutation.isPending}
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Recuerda ser respetuoso y proporcionar respuestas útiles y detalladas.
              </p>
              <Button 
                onClick={handleSubmitAnswer}
                disabled={!newAnswer.trim() || createAnswerMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {createAnswerMutation.isPending ? (
                  <>
                    <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  'Publicar Respuesta'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
