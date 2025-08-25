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
  MoreHorizontal
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

// Mock data for the question and answers
const mockQuestion: Question = {
  id: '1',
  title: '¿Cómo resolver ecuaciones cuadráticas paso a paso?',
  content: `Necesito ayuda para entender el método de factorización y la fórmula cuadrática. 

Estoy trabajando con la ecuación: **x² - 5x + 6 = 0**

He intentado factorizar pero no estoy seguro de los pasos. ¿Podrían explicarme:

1. Cómo identificar si una ecuación se puede factorizar
2. Los pasos para factorizar
3. Cuándo usar la fórmula cuadrática
4. Ejemplos prácticos

¡Gracias por su ayuda!`,
  author: {
    id: '1',
    name: 'María González',
    avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=female%20student%20avatar%20smiling%20portrait&image_size=square',
    level: 'Estudiante',
    points: 150
  },
  subject: 'Matemáticas',
  career: 'Ingeniería',
  tags: ['álgebra', 'ecuaciones', 'matemáticas'],
  votes: 12,
  answers: 3,
  views: 45,
  createdAt: new Date('2024-01-15T10:30:00'),
  hasAcceptedAnswer: true,
  bounty: 50
};

const mockAnswers: Answer[] = [
  {
    id: '1',
    content: `¡Excelente pregunta! Te explico paso a paso cómo resolver ecuaciones cuadráticas:

## Método de Factorización

Para tu ecuación **x² - 5x + 6 = 0**:

1. **Identificar los coeficientes**: a=1, b=-5, c=6
2. **Buscar dos números que multiplicados den 6 y sumados den -5**
   - Los números son -2 y -3 porque: (-2) × (-3) = 6 y (-2) + (-3) = -5
3. **Factorizar**: (x - 2)(x - 3) = 0
4. **Resolver**: x = 2 o x = 3

## Fórmula Cuadrática

Cuando no se puede factorizar fácilmente, usa:
**x = (-b ± √(b² - 4ac)) / 2a**

Para verificar: x = (5 ± √(25 - 24)) / 2 = (5 ± 1) / 2
Resultado: x = 3 o x = 2 ✓

¡Espero que te ayude!`,
    author: {
      id: '2',
      name: 'Prof. Carlos Mendoza',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=male%20professor%20avatar%20smiling%20portrait&image_size=square',
      level: 'Experto',
      points: 2450
    },
    votes: 18,
    createdAt: new Date('2024-01-15T11:15:00'),
    isAccepted: true,
    isEdited: false
  },
  {
    id: '2',
    content: `Complementando la respuesta anterior, aquí tienes algunos consejos adicionales:

**Cuándo usar cada método:**

- **Factorización**: Cuando el discriminante (b² - 4ac) es un cuadrado perfecto
- **Fórmula cuadrática**: Siempre funciona, especialmente cuando la factorización es difícil
- **Completar el cuadrado**: Útil para entender la forma vértice

**Ejemplo adicional:**
Para x² + 4x + 3 = 0:
- Factores de 3 que sumen 4: 3 y 1
- Factorización: (x + 3)(x + 1) = 0
- Soluciones: x = -3 o x = -1

¡Practica con diferentes ejemplos!`,
    author: {
      id: '3',
      name: 'Ana López',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=female%20student%20avatar%20smiling%20portrait&image_size=square',
      level: 'Avanzado',
      points: 320
    },
    votes: 8,
    createdAt: new Date('2024-01-15T12:30:00'),
    isAccepted: false,
    isEdited: true
  },
  {
    id: '3',
    content: `Te recomiendo esta herramienta online para practicar: [Calculadora de ecuaciones cuadráticas]

También puedes verificar tus respuestas sustituyendo los valores encontrados en la ecuación original.

Por ejemplo, para x = 2 en x² - 5x + 6 = 0:
2² - 5(2) + 6 = 4 - 10 + 6 = 0 ✓`,
    author: {
      id: '4',
      name: 'Diego Ramírez',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=male%20student%20avatar%20smiling%20portrait&image_size=square',
      level: 'Estudiante',
      points: 89
    },
    votes: 3,
    createdAt: new Date('2024-01-15T14:20:00'),
    isAccepted: false,
    isEdited: false
  }
];

export function QuestionDetail({ questionId, onBack }: QuestionDetailProps) {
  const [question] = useState(mockQuestion);
  const [answers, setAnswers] = useState(mockAnswers);
  const [newAnswer, setNewAnswer] = useState('');
  const [questionVotes, setQuestionVotes] = useState(question.votes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);

  const handleVote = async (type: 'up' | 'down', answerId?: string) => {
    if (answerId) {
      // Vote on answer
      setAnswers(prev => prev.map(answer => {
        if (answer.id === answerId) {
          let newVotes = answer.votes;
          if (type === 'up') newVotes += 1;
          else newVotes -= 1;
          return { ...answer, votes: newVotes };
        }
        return answer;
      }));
      
      // Grant XP for voting on answer
      try {
        await gamificationService.grantXP(
          'current-user',
          2,
          'forum_vote',
          answerId,
          `Voto ${type === 'up' ? 'positivo' : 'negativo'} en respuesta`
        );
      } catch (error) {
        console.error('Error granting XP for answer vote:', error);
      }
    } else {
      // Vote on question
      if (userVote === type) {
        setUserVote(null);
        setQuestionVotes(prev => type === 'up' ? prev - 1 : prev + 1);
      } else {
        const adjustment = userVote ? (type === 'up' ? 2 : -2) : (type === 'up' ? 1 : -1);
        setUserVote(type);
        setQuestionVotes(prev => prev + adjustment);
        
        // Grant XP for voting on question
        try {
          await gamificationService.grantXP(
            'current-user',
            2,
            'forum_vote',
            questionId,
            `Voto ${type === 'up' ? 'positivo' : 'negativo'} en pregunta`
          );
        } catch (error) {
          console.error('Error granting XP for question vote:', error);
        }
      }
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    const targetAnswer = answers.find(answer => answer.id === answerId);
    const wasAccepted = targetAnswer?.isAccepted;
    
    setAnswers(prev => prev.map(answer => ({
      ...answer,
      isAccepted: answer.id === answerId ? !answer.isAccepted : false
    })));
    
    // Grant XP for accepting an answer (only when accepting, not when removing acceptance)
    if (!wasAccepted && targetAnswer) {
      try {
        await gamificationService.grantXP(
          targetAnswer.author.id,
          25,
          'forum_accepted_answer',
          answerId,
          'Respuesta aceptada como correcta'
        );
      } catch (error) {
        console.error('Error granting XP for accepted answer:', error);
      }
    }
  };

  const handleSubmitAnswer = async () => {
    if (newAnswer.trim()) {
      const answer: Answer = {
        id: Date.now().toString(),
        content: newAnswer,
        author: {
          id: 'current-user',
          name: 'Usuario Actual',
          avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=student%20avatar%20smiling%20portrait&image_size=square',
          level: 'Estudiante',
          points: 100
        },
        votes: 0,
        createdAt: new Date(),
        isAccepted: false,
        isEdited: false
      };
      setAnswers(prev => [...prev, answer]);
      setNewAnswer('');
      
      // Grant XP for answering a question
      try {
        await gamificationService.grantXP(
          'current-user',
          15,
          'forum_answer',
          answer.id,
          'Respuesta publicada en el foro'
        );
      } catch (error) {
        console.error('Error granting XP for answer:', error);
      }
    }
  };

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
                <span className="font-bold text-xl text-gray-700">{questionVotes}</span>
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
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Recuerda ser respetuoso y proporcionar respuestas útiles y detalladas.
              </p>
              <Button 
                onClick={handleSubmitAnswer}
                disabled={!newAnswer.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Publicar Respuesta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}