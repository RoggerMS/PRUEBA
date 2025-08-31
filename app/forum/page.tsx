'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  TrendingUp,
  Award,
  Plus,
  MessageSquare,
  Users,
  CheckCircle,
  Clock,
  LoaderIcon
} from 'lucide-react';
import { useQuestions } from '@/hooks/useForum';

const subjects = ['Todas', 'Matemáticas', 'Física', 'Química', 'Biología', 'Historia', 'Literatura', 'Inglés'];
const careers = ['Todas', 'Ingeniería', 'Medicina', 'Derecho', 'Administración', 'Psicología', 'Educación'];

export default function ForumPage() {
  const [showAskQuestion, setShowAskQuestion] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Todas');
  const [selectedCareer, setSelectedCareer] = useState('Todas');
  const [sortBy, setSortBy] = useState<'recent' | 'votes' | 'answers' | 'views'>('recent');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  const { data: questions = [], isLoading, error } = useQuestions({
    search: searchQuery || undefined,
    subject: selectedSubject !== 'Todas' ? selectedSubject : undefined,
    career: selectedCareer !== 'Todas' ? selectedCareer : undefined,
    sortBy
  });

  const handleAskQuestion = () => {
    setShowAskQuestion(false);
  };

  const handleQuestionSelect = (questionId: string) => {
    setSelectedQuestionId(questionId);
  };

  const handleBackToList = () => {
    setSelectedQuestionId(null);
  };

  // Questions are already filtered and sorted by the API based on the query parameters
  const sortedQuestions = questions;

  if (selectedQuestionId) {
    const selectedQuestion = questions.find(q => q.id === selectedQuestionId);
    if (!selectedQuestion) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pregunta no encontrada</h2>
            <Button onClick={handleBackToList}>Volver al foro</Button>
          </div>
        </div>
      );
    }
    return (
      <QuestionDetail 
        question={selectedQuestion}
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
              {isLoading ? (
                <div className="p-12 text-center">
                  <LoaderIcon className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
                  <p className="text-gray-500">Cargando preguntas...</p>
                </div>
              ) : error ? (
                <div className="p-12 text-center">
                  <div className="text-red-400 mb-4">
                    <Search className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-red-600 mb-2">
                    Error al cargar preguntas
                  </h3>
                  <p className="text-gray-500">
                    Hubo un problema al cargar las preguntas. Intenta recargar la página.
                  </p>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}