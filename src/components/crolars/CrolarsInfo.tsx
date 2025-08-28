'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Info, 
  Coins, 
  Trophy, 
  Target, 
  Users, 
  Zap, 
  Gift, 
  Star, 
  TrendingUp, 
  Shield, 
  Lightbulb, 
  Heart, 
  Gamepad2, 
  Award, 
  Sparkles, 
  ChevronRight, 
  Play, 
  BookOpen, 
  HelpCircle
} from 'lucide-react';

interface CrolarFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
  examples: string[];
}

interface CrolarBenefit {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: string;
}

const CrolarsInfo: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const features: CrolarFeature[] = [
    {
      icon: <Trophy className="w-6 h-6 text-yellow-500" />,
      title: "Sistema de Recompensas",
      description: "Gana Crolars completando desafíos, participando en eventos y alcanzando objetivos.",
      examples: ["Completar desafíos diarios", "Ganar competencias", "Mantener rachas de actividad", "Participar en eventos comunitarios"]
    },
    {
      icon: <Coins className="w-6 h-6 text-green-500" />,
      title: "Moneda Virtual",
      description: "Los Crolars son tu moneda digital para acceder a contenido premium y herramientas exclusivas.",
      examples: ["Comprar avatares únicos", "Desbloquear herramientas pro", "Acceder a cursos premium", "Personalizar tu perfil"]
    },
    {
      icon: <Target className="w-6 h-6 text-blue-500" />,
      title: "Metas y Objetivos",
      description: "Establece metas personales y recibe Crolars al alcanzarlas.",
      examples: ["Metas semanales de aprendizaje", "Objetivos de participación", "Desafíos personalizados", "Logros a largo plazo"]
    },
    {
      icon: <Users className="w-6 h-6 text-purple-500" />,
      title: "Comunidad",
      description: "Interactúa con otros usuarios, forma equipos y participa en actividades grupales.",
      examples: ["Crear equipos de estudio", "Competencias grupales", "Intercambio de recursos", "Mentorías comunitarias"]
    }
  ];

  const benefits: CrolarBenefit[] = [
    {
      icon: <Zap className="w-5 h-5 text-yellow-500" />,
      title: "Motivación Constante",
      description: "Sistema gamificado que te mantiene comprometido con tus objetivos de aprendizaje.",
      value: "100% Engagement"
    },
    {
      icon: <Gift className="w-5 h-5 text-green-500" />,
      title: "Recompensas Tangibles",
      description: "Convierte tu progreso en beneficios reales y contenido exclusivo.",
      value: "500+ Items"
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
      title: "Progreso Medible",
      description: "Visualiza tu crecimiento y celebra cada logro alcanzado.",
      value: "Tracking 24/7"
    },
    {
      icon: <Shield className="w-5 h-5 text-purple-500" />,
      title: "Sistema Justo",
      description: "Algoritmos transparentes que garantizan equidad en la distribución de recompensas.",
      value: "Fair Play"
    }
  ];

  const faqs = [
    {
      id: '1',
      question: "¿Cómo puedo ganar Crolars?",
      answer: "Puedes ganar Crolars de múltiples formas: completando desafíos diarios y semanales, participando en competencias, manteniendo rachas de actividad, invitando amigos, y participando en eventos especiales de la comunidad."
    },
    {
      id: '2',
      question: "¿Los Crolars tienen fecha de vencimiento?",
      answer: "No, los Crolars no expiran. Una vez que los ganas, permanecen en tu cuenta indefinidamente. Sin embargo, algunas promociones especiales pueden tener términos específicos."
    },
    {
      id: '3',
      question: "¿Puedo transferir Crolars a otros usuarios?",
      answer: "Actualmente, los Crolars no son transferibles entre usuarios para mantener la integridad del sistema. Sin embargo, puedes regalar items del marketplace a otros usuarios."
    },
    {
      id: '4',
      question: "¿Qué pasa si pierdo Crolars por inactividad?",
      answer: "Después de 30 días de inactividad, se aplica una pequeña penalización. Sin embargo, puedes recuperar estos Crolars fácilmente volviendo a participar en actividades de la plataforma."
    },
    {
      id: '5',
      question: "¿Hay límites en cuántos Crolars puedo ganar?",
      answer: "No hay límite máximo para acumular Crolars. Sin embargo, algunas actividades tienen límites diarios o semanales para mantener un balance justo en la comunidad."
    }
  ];

  const earningMethods = [
    { method: "Desafíos Diarios", amount: "10-50", frequency: "Diario", difficulty: "Fácil" },
    { method: "Desafíos Semanales", amount: "100-300", frequency: "Semanal", difficulty: "Medio" },
    { method: "Competencias", amount: "200-1000", frequency: "Variable", difficulty: "Difícil" },
    { method: "Rachas de Actividad", amount: "50-200", frequency: "Continuo", difficulty: "Fácil" },
    { method: "Eventos Especiales", amount: "500-2000", frequency: "Mensual", difficulty: "Variable" },
    { method: "Referidos", amount: "100", frequency: "Por referido", difficulty: "Fácil" }
  ];

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-blue-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Coins className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ¿Qué son los Crolars?
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 max-w-2xl mx-auto">
            Los Crolars son nuestra moneda virtual que recompensa tu dedicación, progreso y participación en la comunidad. 
            Descubre cómo funcionan y cómo puedes maximizar tus ganancias.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Navegación por Secciones */}
      <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Info className="w-4 h-4" />
            <span>Resumen</span>
          </TabsTrigger>
          <TabsTrigger value="earning" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Cómo Ganar</span>
          </TabsTrigger>
          <TabsTrigger value="benefits" className="flex items-center space-x-2">
            <Star className="w-4 h-4" />
            <span>Beneficios</span>
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center space-x-2">
            <HelpCircle className="w-4 h-4" />
            <span>FAQ</span>
          </TabsTrigger>
        </TabsList>

        {/* Sección: Resumen */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Ejemplos:</p>
                    <ul className="space-y-1">
                      {feature.examples.map((example, idx) => (
                        <li key={idx} className="flex items-center space-x-2 text-sm text-gray-600">
                          <ChevronRight className="w-3 h-3 text-gray-400" />
                          <span>{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Estadísticas Destacadas */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <span>Estadísticas de la Comunidad</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">2.5M+</p>
                  <p className="text-sm text-gray-600">Crolars Distribuidos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">15K+</p>
                  <p className="text-sm text-gray-600">Usuarios Activos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">500+</p>
                  <p className="text-sm text-gray-600">Items Disponibles</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">98%</p>
                  <p className="text-sm text-gray-600">Satisfacción</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sección: Cómo Ganar */}
        <TabsContent value="earning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Coins className="w-5 h-5 text-yellow-500" />
                <span>Métodos para Ganar Crolars</span>
              </CardTitle>
              <CardDescription>
                Descubre todas las formas de ganar Crolars y maximiza tus recompensas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {earningMethods.map((method, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-white rounded-lg">
                        <Award className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{method.method}</h4>
                        <p className="text-sm text-gray-600">Frecuencia: {method.frequency}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{method.amount} Crolars</p>
                      <Badge 
                        variant={method.difficulty === 'Fácil' ? 'default' : method.difficulty === 'Medio' ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {method.difficulty}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tips para Maximizar Ganancias */}
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <span>Tips para Maximizar tus Ganancias</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-1 bg-yellow-200 rounded-full mt-1">
                      <Star className="w-3 h-3 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Mantén tu Racha</h4>
                      <p className="text-sm text-gray-600">La consistencia diaria multiplica tus recompensas</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="p-1 bg-yellow-200 rounded-full mt-1">
                      <Users className="w-3 h-3 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Participa en Comunidad</h4>
                      <p className="text-sm text-gray-600">Los eventos grupales ofrecen bonificaciones especiales</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-1 bg-yellow-200 rounded-full mt-1">
                      <Target className="w-3 h-3 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Completa Desafíos</h4>
                      <p className="text-sm text-gray-600">Los desafíos semanales dan las mejores recompensas</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="p-1 bg-yellow-200 rounded-full mt-1">
                      <Heart className="w-3 h-3 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Invita Amigos</h4>
                      <p className="text-sm text-gray-600">Cada referido exitoso te da bonus permanentes</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sección: Beneficios */}
        <TabsContent value="benefits" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {benefit.icon}
                      </div>
                      <h3 className="font-semibold text-gray-800">{benefit.title}</h3>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">{benefit.value}</Badge>
                  </div>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-6 text-center">
              <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-white" />
              <h3 className="text-xl font-bold mb-2">¡Comienza a Ganar Crolars Hoy!</h3>
              <p className="mb-4 text-blue-100">
                Únete a miles de usuarios que ya están maximizando su experiencia con nuestro sistema de recompensas.
              </p>
              <div className="flex justify-center space-x-4">
                <Button className="bg-white text-blue-600 hover:bg-gray-100">
                  <Play className="w-4 h-4 mr-2" />
                  Empezar Ahora
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Ver Guía
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sección: FAQ */}
        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-blue-500" />
                <span>Preguntas Frecuentes</span>
              </CardTitle>
              <CardDescription>
                Encuentra respuestas a las preguntas más comunes sobre los Crolars
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {faqs.map((faq) => (
                  <div key={faq.id} className="border border-gray-200 rounded-lg">
                    <button
                      className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    >
                      <span className="font-medium text-gray-800">{faq.question}</span>
                      <ChevronRight 
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedFAQ === faq.id ? 'rotate-90' : ''
                        }`} 
                      />
                    </button>
                    {expandedFAQ === faq.id && (
                      <div className="px-4 pb-4">
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CrolarsInfo;