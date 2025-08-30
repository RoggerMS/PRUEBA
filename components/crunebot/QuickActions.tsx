'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calculator, 
  Code, 
  BookOpen, 
  FileText, 
  Lightbulb, 
  MessageSquare, 
  Search, 
  Zap, 
  Clock, 
  Star, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Copy, 
  Share, 
  Download,
  Brain,
  Target,
  Globe,
  Users,
  Calendar,
  Award,
  TrendingUp,
  HelpCircle
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  icon: React.ComponentType<any>;
  color: string;
  usage: number;
  isFavorite: boolean;
}

interface QuickActionsProps {
  onActionSelect: (action: QuickAction) => void;
}

export function QuickActions({ onActionSelect }: QuickActionsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreating, setIsCreating] = useState(false);
  const [newAction, setNewAction] = useState({
    title: '',
    description: '',
    prompt: '',
    category: 'general'
  });

  const [actions, setActions] = useState<QuickAction[]>([
    {
      id: '1',
      title: 'Explicar concepto',
      description: 'Obtener una explicación detallada de cualquier concepto',
      prompt: 'Explícame de manera clara y detallada el concepto de: [CONCEPTO]',
      category: 'learning',
      icon: BookOpen,
      color: 'text-blue-500',
      usage: 45,
      isFavorite: true
    },
    {
      id: '2',
      title: 'Revisar código',
      description: 'Análisis y sugerencias para mejorar código',
      prompt: 'Revisa este código y sugiere mejoras: [CÓDIGO]',
      category: 'coding',
      icon: Code,
      color: 'text-green-500',
      usage: 38,
      isFavorite: true
    },
    {
      id: '3',
      title: 'Resolver problema matemático',
      description: 'Ayuda paso a paso con problemas matemáticos',
      prompt: 'Ayúdame a resolver este problema matemático paso a paso: [PROBLEMA]',
      category: 'math',
      icon: Calculator,
      color: 'text-purple-500',
      usage: 32,
      isFavorite: false
    },
    {
      id: '4',
      title: 'Generar ideas',
      description: 'Lluvia de ideas creativas para proyectos',
      prompt: 'Genera 5 ideas creativas para: [TEMA/PROYECTO]',
      category: 'creative',
      icon: Lightbulb,
      color: 'text-yellow-500',
      usage: 28,
      isFavorite: false
    },
    {
      id: '5',
      title: 'Resumir texto',
      description: 'Crear resúmenes concisos de textos largos',
      prompt: 'Resume este texto de manera concisa manteniendo los puntos clave: [TEXTO]',
      category: 'writing',
      icon: FileText,
      color: 'text-indigo-500',
      usage: 25,
      isFavorite: true
    },
    {
      id: '6',
      title: 'Planificar estudio',
      description: 'Crear plan de estudio personalizado',
      prompt: 'Crea un plan de estudio para: [MATERIA/TEMA] con duración de [TIEMPO]',
      category: 'planning',
      icon: Calendar,
      color: 'text-red-500',
      usage: 22,
      isFavorite: false
    },
    {
      id: '7',
      title: 'Traducir texto',
      description: 'Traducción precisa entre idiomas',
      prompt: 'Traduce este texto de [IDIOMA_ORIGEN] a [IDIOMA_DESTINO]: [TEXTO]',
      category: 'language',
      icon: Globe,
      color: 'text-cyan-500',
      usage: 20,
      isFavorite: false
    },
    {
      id: '8',
      title: 'Preparar presentación',
      description: 'Estructura y contenido para presentaciones',
      prompt: 'Ayúdame a estructurar una presentación sobre: [TEMA] para [AUDIENCIA]',
      category: 'presentation',
      icon: Users,
      color: 'text-orange-500',
      usage: 18,
      isFavorite: false
    },
    {
      id: '9',
      title: 'Analizar datos',
      description: 'Interpretación y análisis de conjuntos de datos',
      prompt: 'Analiza estos datos y proporciona insights: [DATOS]',
      category: 'analysis',
      icon: TrendingUp,
      color: 'text-emerald-500',
      usage: 15,
      isFavorite: false
    },
    {
      id: '10',
      title: 'Resolver dudas',
      description: 'Respuestas rápidas a preguntas específicas',
      prompt: 'Tengo una duda sobre: [PREGUNTA]',
      category: 'general',
      icon: HelpCircle,
      color: 'text-gray-500',
      usage: 12,
      isFavorite: false
    }
  ]);

  const categories = [
    { id: 'all', name: 'Todas', count: actions.length },
    { id: 'learning', name: 'Aprendizaje', count: actions.filter(a => a.category === 'learning').length },
    { id: 'coding', name: 'Programación', count: actions.filter(a => a.category === 'coding').length },
    { id: 'math', name: 'Matemáticas', count: actions.filter(a => a.category === 'math').length },
    { id: 'creative', name: 'Creatividad', count: actions.filter(a => a.category === 'creative').length },
    { id: 'writing', name: 'Escritura', count: actions.filter(a => a.category === 'writing').length },
    { id: 'planning', name: 'Planificación', count: actions.filter(a => a.category === 'planning').length },
    { id: 'general', name: 'General', count: actions.filter(a => a.category === 'general').length }
  ];

  const filteredActions = actions.filter(action => {
    const matchesSearch = action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         action.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || action.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const favoriteActions = actions.filter(action => action.isFavorite);
  const popularActions = [...actions].sort((a, b) => b.usage - a.usage).slice(0, 5);

  const toggleFavorite = (actionId: string) => {
    setActions(prev => prev.map(action => 
      action.id === actionId 
        ? { ...action, isFavorite: !action.isFavorite }
        : action
    ));
  };

  const handleActionClick = (action: QuickAction) => {
    // Increment usage count
    setActions(prev => prev.map(a => 
      a.id === action.id 
        ? { ...a, usage: a.usage + 1 }
        : a
    ));
    
    onActionSelect(action);
  };

  const createNewAction = () => {
    if (!newAction.title || !newAction.prompt) return;
    
    const action: QuickAction = {
      id: Date.now().toString(),
      title: newAction.title,
      description: newAction.description,
      prompt: newAction.prompt,
      category: newAction.category,
      icon: MessageSquare,
      color: 'text-blue-500',
      usage: 0,
      isFavorite: false
    };
    
    setActions(prev => [action, ...prev]);
    setNewAction({ title: '', description: '', prompt: '', category: 'general' });
    setIsCreating(false);
  };

  const deleteAction = (actionId: string) => {
    setActions(prev => prev.filter(action => action.id !== actionId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Acciones Rápidas</h2>
          <p className="text-gray-600">Comandos predefinidos para consultas frecuentes</p>
        </div>
        
        <Button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nueva acción
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar acciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap"
            >
              {category.name}
              <Badge variant="secondary" className="ml-2">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Create New Action Modal */}
      {isCreating && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Crear nueva acción rápida
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Título</label>
                <Input
                  placeholder="Nombre de la acción"
                  value={newAction.title}
                  onChange={(e) => setNewAction(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Categoría</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={newAction.category}
                  onChange={(e) => setNewAction(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="general">General</option>
                  <option value="learning">Aprendizaje</option>
                  <option value="coding">Programación</option>
                  <option value="math">Matemáticas</option>
                  <option value="creative">Creatividad</option>
                  <option value="writing">Escritura</option>
                  <option value="planning">Planificación</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Descripción</label>
              <Input
                placeholder="Breve descripción de la acción"
                value={newAction.description}
                onChange={(e) => setNewAction(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Prompt</label>
              <Textarea
                placeholder="Escribe el prompt que se enviará al bot. Usa [VARIABLE] para campos que el usuario completará."
                value={newAction.prompt}
                onChange={(e) => setNewAction(prev => ({ ...prev, prompt: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="flex items-center gap-2 pt-2">
              <Button onClick={createNewAction} disabled={!newAction.title || !newAction.prompt}>
                Crear acción
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de acciones</p>
                <p className="text-2xl font-bold">{actions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Favoritas</p>
                <p className="text-2xl font-bold">{favoriteActions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Usos totales</p>
                <p className="text-2xl font-bold">{actions.reduce((sum, action) => sum + action.usage, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Favorites Section */}
      {favoriteActions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Acciones favoritas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteActions.map(action => {
              const Icon = action.icon;
              return (
                <Card key={action.id} className="hover:shadow-md transition-shadow cursor-pointer border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 bg-gray-100 rounded-lg ${action.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(action.id);
                          }}
                        >
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </Button>
                      </div>
                    </div>
                    
                    <h4 className="font-semibold mb-2">{action.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {action.usage} usos
                      </Badge>
                      <Button 
                        size="sm"
                        onClick={() => handleActionClick(action)}
                        className="flex items-center gap-1"
                      >
                        <Play className="h-3 w-3" />
                        Usar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* All Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-3">
          {selectedCategory === 'all' ? 'Todas las acciones' : `Acciones de ${categories.find(c => c.id === selectedCategory)?.name}`}
          <Badge variant="outline" className="ml-2">
            {filteredActions.length}
          </Badge>
        </h3>
        
        {filteredActions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron acciones que coincidan con tu búsqueda.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredActions.map(action => {
              const Icon = action.icon;
              return (
                <Card key={action.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 bg-gray-100 rounded-lg ${action.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(action.id);
                          }}
                        >
                          <Star className={`h-4 w-4 ${action.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                        </Button>
                        
                        {action.usage === 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAction(action.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <h4 className="font-semibold mb-2">{action.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {action.usage} usos
                      </Badge>
                      <Button 
                        size="sm"
                        onClick={() => handleActionClick(action)}
                        className="flex items-center gap-1"
                      >
                        <Play className="h-3 w-3" />
                        Usar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}