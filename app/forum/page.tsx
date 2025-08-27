'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuestionCard } from '@/components/forum/QuestionCard';
import { AskQuestion } from '@/components/forum/AskQuestion';
import { QuestionDetail } from '@/components/forum/QuestionDetail';
import { 
  Search, 
  Filter, 
  Plus, 
  TrendingUp, 
  Clock, 
  Award, 
  Users,
  BookOpen,
  MessageCircle
} from 'lucide-react';

// Mock data for questions
const mockQuestions = [
  {
    id: '1',
    title: '¿Cómo resolver ecuaciones cuadráticas paso a paso?',
    content: 'Necesito ayuda para entender el método de factorización y la fórmula cuadrática. ¿Podrían explicarme con ejemplos?',
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
  },
  {
    id: '2',
    title: '¿Cuál es la diferencia entre mitosis y meiosis?',
    content: 'Estoy confundido con los procesos de división celular. ¿Podrían ayudarme a entender las diferencias principales?',
    author: {
      id: '2',
      name: 'Carlos Ruiz',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=male%20student%20avatar%20smiling%20portrait&image_size=square',
      level: 'Estudiante',
      points: 89
    },
    subject: 'Biología',
    career: 'Medicina',
    tags: ['biología', 'células', 'división celular'],
    votes: 8,
    answers: 2,
    views: 32,
    createdAt: new Date('2024-01-14T15:45:00'),
    hasAcceptedAnswer: false,
    bounty: 0
  },
  {
    id: '3',
    title: '¿Cómo calcular la derivada de funciones compuestas?',
    content: 'Tengo problemas con la regla de la cadena. ¿Podrían mostrarme algunos ejemplos prácticos?',
    author: {
      id: '3',
      name: 'Ana López',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=female%20student%20avatar%20smiling%20portrait&image_size=square',
      level: 'Avanzado',
      points: 320
    },
    subject: 'Cálculo',
    career: 'Ingeniería',
    tags: ['cálculo', 'derivadas', 'regla de la cadena'],
    votes: 15,
    answers: 4,
    views: 67,
    createdAt: new Date('2024-01-13T09:20:00'),
    hasAcceptedAnswer: true,
    bounty: 0
  }
];

const subjects = ['Todas', 'Matemáticas', 'Física', 'Química', 'Biología', 'Historia', 'Literatura', 'Inglés'];
const careers = ['Todas', 'Ingeniería', 'Medicina', 'Derecho', 'Administración', 'Psicología', 'Educación'];

export default function ForumPage() {
  const [questions, setQuestions] = useState(mockQuestions);
  const [showAskQuestion, setShowAskQuestion] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Todas');
  const [selectedCareer, setSelectedCareer] = useState('Todas');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  const handleAskQuestion = (questionData: any) => {
    const newQuestion = {
      id: Date.now().toString(),
      ...questionData,
      author: {
        id: 'current-user',
        name: 'Usuario Actual',
        avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=student%20avatar%20smiling%20portrait&image_size=square',
        level: 'Estudiante',
        points: 100
      },
      votes: 0,
      answers: 0,
      views: 0,
      createdAt: new Date(),
      hasAcceptedAnswer: false,
      bounty: questionData.bounty || 0
    };
    setQuestions([newQuestion, ...questions]);
    setShowAskQuestion(false);
  };

  const handleQuestionSelect = (questionId: string) => {
    setSelectedQuestionId(questionId);
  };

  const handleBackToList = () => {
    setSelectedQuestionId(null);
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = searchQuery === '' || 
      question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSubject = selectedSubject === 'Todas' || question.subject === selectedSubject;
    const matchesCareer = selectedCareer === 'Todas' || question.career === selectedCareer;
    
    return matchesSearch && matchesSubject && matchesCareer;
  });

  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'votes':
        return b.votes - a.votes;
      case 'answers':
        return b.answers - a.answers;
      case 'views':
        return b.views - a.views;
      default:
        return 0;
    }
  });

  if (selectedQuestionId) {
    return (
      <QuestionDetail 
        questionId={selectedQuestionId}
        onBack={handleBackToList}
      />
    );
  }

  if (showAskQuestion) {
    return (
      <AskQuestion 
        onSubmit={handleAskQuestion}
        onCancel={() => setShowAskQuestion(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Foro Académico
              </h1>
              <p className="text-gray-600 mt-2">Pregunta, aprende y ayuda a otros estudiantes</p>
            </div>
            <Button 
              onClick={() => setShowAskQuestion(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Hacer Pregunta
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
            <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Preguntas Activas</p>
                    <p className="text-xl font-bold text-purple-600">1,234</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Award className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Respuestas Aceptadas</p>
                    <p className="text-xl font-bold text-blue-600">892</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Usuarios Activos</p>
                    <p className="text-xl font-bold text-green-600">456</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tiempo Promedio</p>
                    <p className="text-xl font-bold text-orange-600">2.5h</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white/70 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5 text-purple-600" />
              Buscar y Filtrar Preguntas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar preguntas, temas o palabras clave..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <select
                  value={selectedCareer}
                  onChange={(e) => setSelectedCareer(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  {careers.map(career => (
                    <option key={career} value={career}>{career}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700">Ordenar por:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSortBy('recent')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    sortBy === 'recent'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Más Recientes
                </button>
                <button
                  onClick={() => setSortBy('votes')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    sortBy === 'votes'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Más Votadas
                </button>
                <button
                  onClick={() => setSortBy('answers')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    sortBy === 'answers'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Más Respuestas
                </button>
                <button
                  onClick={() => setSortBy('views')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    sortBy === 'views'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Más Vistas
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions Section */}
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-purple-600" />
                Preguntas del Foro ({sortedQuestions.length})
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {sortedQuestions.filter(q => !q.hasAcceptedAnswer).length} sin responder
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedQuestions.map(question => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  onClick={() => handleQuestionSelect(question.id)}
                />
              ))}
              
              {sortedQuestions.length === 0 && (
                <div className="p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <Search className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No se encontraron preguntas
                  </h3>
                  <p className="text-gray-500">
                    Intenta ajustar tus filtros de búsqueda o haz la primera pregunta.
                  </p>
                  <Button 
                    onClick={() => setShowAskQuestion(true)}
                    className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Hacer Pregunta
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}