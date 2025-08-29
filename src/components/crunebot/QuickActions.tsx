"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Calculator, 
  BookOpen, 
  Code, 
  Languages, 
  Beaker, 
  PenTool, 
  Globe, 
  Music, 
  Palette,
  Brain,
  Target,
  Clock,
  Lightbulb,
  FileText,
  HelpCircle
} from "lucide-react";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  category: string;
  prompt: string;
  popular?: boolean;
}

interface QuickActionsProps {
  onActionSelect: (action: QuickAction) => void;
}

export function QuickActions({ onActionSelect }: QuickActionsProps) {
  const quickActions: QuickAction[] = [
    // Matemáticas
    {
      id: "solve-equation",
      title: "Resolver Ecuación",
      description: "Resuelve ecuaciones paso a paso",
      icon: Calculator,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      category: "Matemáticas",
      prompt: "Ayúdame a resolver esta ecuación paso a paso:",
      popular: true
    },
    {
      id: "explain-concept",
      title: "Explicar Concepto",
      description: "Explica conceptos matemáticos",
      icon: Brain,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      category: "Matemáticas",
      prompt: "Explícame este concepto matemático de forma sencilla:"
    },
    
    // Programación
    {
      id: "debug-code",
      title: "Debuggear Código",
      description: "Encuentra y corrige errores",
      icon: Code,
      color: "text-green-600",
      bgColor: "bg-green-100",
      category: "Programación",
      prompt: "Ayúdame a encontrar el error en este código:",
      popular: true
    },
    {
      id: "explain-algorithm",
      title: "Explicar Algoritmo",
      description: "Entiende algoritmos complejos",
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-100",
      category: "Programación",
      prompt: "Explícame cómo funciona este algoritmo:"
    },
    
    // Ciencias
    {
      id: "chemistry-help",
      title: "Ayuda en Química",
      description: "Reacciones y fórmulas químicas",
      icon: Beaker,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      category: "Ciencias",
      prompt: "Necesito ayuda con este problema de química:"
    },
    {
      id: "physics-problem",
      title: "Problema de Física",
      description: "Resuelve problemas de física",
      icon: Zap,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      category: "Ciencias",
      prompt: "Ayúdame a resolver este problema de física:",
      popular: true
    },
    
    // Idiomas
    {
      id: "translate-text",
      title: "Traducir Texto",
      description: "Traduce entre idiomas",
      icon: Languages,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      category: "Idiomas",
      prompt: "Traduce este texto y explica la gramática:"
    },
    {
      id: "grammar-check",
      title: "Revisar Gramática",
      description: "Corrige errores gramaticales",
      icon: PenTool,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      category: "Idiomas",
      prompt: "Revisa la gramática de este texto:"
    },
    
    // Historia
    {
      id: "historical-context",
      title: "Contexto Histórico",
      description: "Explica eventos históricos",
      icon: Globe,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      category: "Historia",
      prompt: "Explícame el contexto histórico de:"
    },
    
    // Literatura
    {
      id: "analyze-text",
      title: "Analizar Texto",
      description: "Análisis literario profundo",
      icon: BookOpen,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      category: "Literatura",
      prompt: "Ayúdame a analizar este texto literario:"
    },
    
    // Arte
    {
      id: "art-analysis",
      title: "Análisis Artístico",
      description: "Interpreta obras de arte",
      icon: Palette,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
      category: "Arte",
      prompt: "Analiza esta obra de arte:"
    },
    
    // Música
    {
      id: "music-theory",
      title: "Teoría Musical",
      description: "Conceptos de teoría musical",
      icon: Music,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100",
      category: "Música",
      prompt: "Explícame este concepto de teoría musical:"
    },
    
    // Estudio
    {
      id: "study-plan",
      title: "Plan de Estudio",
      description: "Crea un plan personalizado",
      icon: Clock,
      color: "text-teal-600",
      bgColor: "bg-teal-100",
      category: "Estudio",
      prompt: "Ayúdame a crear un plan de estudio para:"
    },
    {
      id: "brainstorm",
      title: "Lluvia de Ideas",
      description: "Genera ideas creativas",
      icon: Lightbulb,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      category: "Creatividad",
      prompt: "Ayúdame a generar ideas sobre:"
    },
    {
      id: "essay-help",
      title: "Ayuda con Ensayo",
      description: "Estructura y mejora ensayos",
      icon: FileText,
      color: "text-slate-600",
      bgColor: "bg-slate-100",
      category: "Escritura",
      prompt: "Ayúdame a mejorar este ensayo:"
    },
    {
      id: "general-question",
      title: "Pregunta General",
      description: "Cualquier duda académica",
      icon: HelpCircle,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      category: "General",
      prompt: "Tengo una pregunta sobre:"
    }
  ];

  const categories = Array.from(new Set(quickActions.map(action => action.category)));
  const popularActions = quickActions.filter(action => action.popular);

  return (
    <div className="space-y-6">
      {/* Popular Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Acciones Populares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {popularActions.map((action) => {
              const Icon = action.icon;
              return (
                <Card
                  key={action.id}
                  className="cursor-pointer transition-all hover:shadow-md hover:scale-105"
                  onClick={() => onActionSelect(action)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${action.bgColor}`}>
                        <Icon className={`h-4 w-4 ${action.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 text-sm truncate">
                            {action.title}
                          </h4>
                          <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                            Popular
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* All Actions by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Todas las Acciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {categories.map((category) => {
              const categoryActions = quickActions.filter(action => action.category === category);
              
              return (
                <div key={category} className="space-y-3">
                  <h3 className="font-medium text-gray-900 text-sm border-b border-gray-200 pb-2">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categoryActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <Card
                          key={action.id}
                          className="cursor-pointer transition-all hover:shadow-md hover:bg-gray-50"
                          onClick={() => onActionSelect(action)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${action.bgColor}`}>
                                <Icon className={`h-4 w-4 ${action.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-gray-900 text-sm truncate">
                                    {action.title}
                                  </h4>
                                  {action.popular && (
                                    <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                                      Popular
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                  {action.description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Usage Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Consejos de Uso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Selecciona una acción rápida para comenzar con un prompt predefinido</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Puedes modificar el prompt después de seleccionar una acción</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Las acciones populares son las más utilizadas por otros estudiantes</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Siempre puedes hacer preguntas personalizadas sin usar acciones rápidas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
