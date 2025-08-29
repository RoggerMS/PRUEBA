"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  HelpCircle, 
  User, 
  GraduationCap, 
  MessageCircle, 
  ShoppingCart, 
  Trophy, 
  Bell, 
  Shield, 
  Settings, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Mail, 
  Phone, 
  BookOpen, 
  Video, 
  FileText, 
  Users, 
  Star, 
  Clock
} from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  helpful: number;
  views: number;
}

interface HelpCategory {
  id: string;
  name: string;
  icon: any;
  description: string;
  color: string;
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories: HelpCategory[] = [
    {
      id: 'account',
      name: 'Cuenta y Perfil',
      icon: User,
      description: 'Gestión de cuenta, perfil y configuración personal',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'academic',
      name: 'Académico',
      icon: GraduationCap,
      description: 'Notas, biblioteca, recursos de estudio',
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'forum',
      name: 'Foro',
      icon: MessageCircle,
      description: 'Participación en foros y discusiones',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'marketplace',
      name: 'Marketplace',
      icon: ShoppingCart,
      description: 'Compra, venta e intercambio de productos',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      id: 'gamification',
      name: 'Crolars y Gamificación',
      icon: Trophy,
      description: 'Sistema de puntos, logros y recompensas',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      id: 'technical',
      name: 'Técnico',
      icon: Settings,
      description: 'Problemas técnicos y configuración',
      color: 'bg-red-100 text-red-600'
    },
    {
      id: 'security',
      name: 'Seguridad',
      icon: Shield,
      description: 'Privacidad, seguridad y protección de datos',
      color: 'bg-indigo-100 text-indigo-600'
    }
  ];

  const faqItems: FAQItem[] = [
    // Account & Profile
    {
      id: '1',
      question: '¿Cómo puedo crear una cuenta en CRUNEVO?',
      answer: 'Para crear una cuenta, haz clic en "Registrarse" en la página principal. Necesitarás tu correo universitario, nombre completo y seleccionar tu universidad. Recibirás un correo de verificación para activar tu cuenta.',
      category: 'account',
      tags: ['registro', 'cuenta', 'email', 'verificación'],
      helpful: 45,
      views: 234
    },
    {
      id: '2',
      question: '¿Cómo puedo recuperar mi contraseña?',
      answer: 'En la página de inicio de sesión, haz clic en "Olvidé mi contraseña". Ingresa tu correo electrónico y recibirás un enlace para restablecer tu contraseña. El enlace es válido por 24 horas.',
      category: 'account',
      tags: ['contraseña', 'recuperar', 'email', 'restablecer'],
      helpful: 67,
      views: 189
    },
    {
      id: '3',
      question: '¿Puedo cambiar mi universidad después de registrarme?',
      answer: 'Sí, puedes cambiar tu universidad desde tu perfil en Configuración > Información Académica. Ten en cuenta que esto puede afectar tu acceso a ciertos grupos y contenido específico de tu universidad anterior.',
      category: 'account',
      tags: ['universidad', 'cambiar', 'perfil', 'configuración'],
      helpful: 23,
      views: 156
    },
    
    // Academic
    {
      id: '4',
      question: '¿Cómo puedo subir mis notas a la biblioteca?',
      answer: 'Ve a la sección "Notas" y haz clic en "Subir Nota". Puedes subir archivos PDF, imágenes o documentos de Word. Asegúrate de agregar tags relevantes y seleccionar la materia correcta para que otros estudiantes puedan encontrar tu contenido fácilmente.',
      category: 'academic',
      tags: ['notas', 'subir', 'biblioteca', 'PDF', 'tags'],
      helpful: 89,
      views: 445
    },
    {
      id: '5',
      question: '¿Puedo descargar notas de otros estudiantes?',
      answer: 'Sí, puedes descargar notas compartidas por otros estudiantes. Algunas notas son gratuitas, mientras que otras pueden requerir Crolars. Siempre respeta los derechos de autor y usa el material de manera ética.',
      category: 'academic',
      tags: ['descargar', 'notas', 'crolars', 'gratuitas'],
      helpful: 76,
      views: 378
    },
    
    // Forum
    {
      id: '6',
      question: '¿Cómo puedo participar en los foros?',
      answer: 'Navega a la sección "Foro" y selecciona un tema de tu interés. Puedes crear nuevos hilos de discusión o responder a publicaciones existentes. Recuerda seguir las reglas de la comunidad y mantener un tono respetuoso.',
      category: 'forum',
      tags: ['foro', 'participar', 'discusión', 'hilos', 'comunidad'],
      helpful: 54,
      views: 267
    },
    {
      id: '7',
      question: '¿Qué son las reglas del foro?',
      answer: 'Las reglas incluyen: mantener respeto hacia otros usuarios, no hacer spam, no compartir contenido inapropiado, citar fuentes cuando sea necesario, y contribuir de manera constructiva a las discusiones. Las violaciones pueden resultar en advertencias o suspensión.',
      category: 'forum',
      tags: ['reglas', 'foro', 'respeto', 'spam', 'suspensión'],
      helpful: 32,
      views: 198
    },
    
    // Marketplace
    {
      id: '8',
      question: '¿Cómo puedo vender algo en el marketplace?',
      answer: 'Ve a "Marketplace" y haz clic en "Vender Producto". Sube fotos claras, escribe una descripción detallada, establece un precio justo y selecciona la categoría apropiada. Los productos deben cumplir con nuestras políticas de contenido.',
      category: 'marketplace',
      tags: ['vender', 'marketplace', 'producto', 'fotos', 'precio'],
      helpful: 91,
      views: 523
    },
    {
      id: '9',
      question: '¿Es seguro comprar en el marketplace?',
      answer: 'CRUNEVO proporciona un sistema de calificaciones y reseñas para ayudarte a tomar decisiones informadas. Siempre revisa el perfil del vendedor, lee las reseñas y comunícate directamente antes de realizar una compra. Para transacciones de alto valor, considera reunirte en persona.',
      category: 'marketplace',
      tags: ['seguro', 'comprar', 'calificaciones', 'reseñas', 'vendedor'],
      helpful: 68,
      views: 312
    },
    
    // Gamification
    {
      id: '10',
      question: '¿Qué son los Crolars y cómo los gano?',
      answer: 'Los Crolars son la moneda virtual de CRUNEVO. Los ganas participando activamente: subiendo notas de calidad (+10), respondiendo en foros (+5), recibiendo likes (+2), completando tu perfil (+20), y participando en desafíos especiales. También puedes ganar bonos por actividad diaria.',
      category: 'gamification',
      tags: ['crolars', 'ganar', 'moneda', 'actividad', 'bonos'],
      helpful: 156,
      views: 789
    },
    {
      id: '11',
      question: '¿Para qué puedo usar mis Crolars?',
      answer: 'Puedes usar Crolars para: descargar notas premium, destacar tus publicaciones en el foro, acceder a contenido exclusivo, participar en sorteos especiales, y canjear por productos en el marketplace. También puedes donar Crolars a otros estudiantes.',
      category: 'gamification',
      tags: ['usar', 'crolars', 'premium', 'destacar', 'sorteos'],
      helpful: 134,
      views: 645
    },
    
    // Technical
    {
      id: '12',
      question: '¿Por qué no puedo subir mi archivo?',
      answer: 'Verifica que tu archivo no exceda 50MB, esté en un formato compatible (PDF, DOC, DOCX, JPG, PNG), y que tengas una conexión estable a internet. Si el problema persiste, intenta desde otro navegador o contacta a soporte técnico.',
      category: 'technical',
      tags: ['subir', 'archivo', '50MB', 'formato', 'navegador'],
      helpful: 43,
      views: 287
    },
    {
      id: '13',
      question: '¿CRUNEVO funciona en dispositivos móviles?',
      answer: 'Sí, CRUNEVO está optimizado para dispositivos móviles. Puedes acceder desde cualquier navegador móvil. También estamos desarrollando una aplicación móvil nativa que estará disponible próximamente en App Store y Google Play.',
      category: 'technical',
      tags: ['móvil', 'dispositivos', 'navegador', 'app', 'nativa'],
      helpful: 87,
      views: 456
    },
    
    // Security
    {
      id: '14',
      question: '¿Cómo protege CRUNEVO mi información personal?',
      answer: 'Utilizamos encriptación SSL, almacenamiento seguro de datos, autenticación de dos factores opcional, y cumplimos con las leyes de protección de datos de Perú. Nunca compartimos tu información personal con terceros sin tu consentimiento explícito.',
      category: 'security',
      tags: ['protección', 'información', 'SSL', 'encriptación', 'datos'],
      helpful: 72,
      views: 334
    },
    {
      id: '15',
      question: '¿Puedo hacer mi perfil privado?',
      answer: 'Sí, en Configuración > Privacidad puedes controlar qué información es visible para otros usuarios. Puedes hacer privado tu perfil completo, ocultar tu actividad, o personalizar qué elementos específicos son visibles.',
      category: 'security',
      tags: ['perfil', 'privado', 'configuración', 'privacidad', 'visible'],
      helpful: 58,
      views: 298
    }
  ];

  const filteredFAQs = useMemo(() => {
    let filtered = faqItems;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return filtered.sort((a, b) => b.helpful - a.helpful);
  }, [searchQuery, selectedCategory]);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const quickActions = [
    {
      title: "Contactar Soporte",
      description: "Habla directamente con nuestro equipo",
      icon: Mail,
      action: "/contact",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Guías de Usuario",
      description: "Tutoriales paso a paso",
      icon: BookOpen,
      action: "#guides",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "Videos Tutoriales",
      description: "Aprende viendo",
      icon: Video,
      action: "#videos",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "Comunidad",
      description: "Pregunta a otros usuarios",
      icon: Users,
      action: "/forum",
      color: "bg-orange-500 hover:bg-orange-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Centro de Ayuda
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Encuentra respuestas a tus preguntas sobre CRUNEVO. 
            Si no encuentras lo que buscas, no dudes en contactarnos.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Buscar en preguntas frecuentes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Link key={index} href={action.action}>
                <Card className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className={`inline-flex p-3 rounded-full text-white ${action.color} group-hover:scale-110 transition-transform`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {action.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  Categorías
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                  className="w-full justify-start gap-2"
                  onClick={() => setSelectedCategory('all')}
                >
                  <HelpCircle className="h-4 w-4" />
                  Todas las preguntas
                  <Badge variant="secondary" className="ml-auto">
                    {faqItems.length}
                  </Badge>
                </Button>
                
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  const count = faqItems.filter(item => item.category === category.id).length;
                  
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'ghost'}
                      className="w-full justify-start gap-2 h-auto p-3"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <div className={`p-1 rounded ${category.color}`}>
                        <IconComponent className="h-3 w-3" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm">
                          {category.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {count} preguntas
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-800">
                {selectedCategory === 'all' 
                  ? 'Todas las Preguntas' 
                  : categories.find(c => c.id === selectedCategory)?.name
                }
              </h2>
              <Badge variant="outline" className="text-gray-600">
                {filteredFAQs.length} resultado{filteredFAQs.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            {/* FAQ Items */}
            {filteredFAQs.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
                <CardContent className="p-12 text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="p-4 bg-gray-100 rounded-full">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      No se encontraron resultados
                    </h3>
                    <p className="text-gray-600 mb-6">
                      No encontramos preguntas que coincidan con tu búsqueda. 
                      Intenta con otros términos o contacta a nuestro equipo de soporte.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                      <Button 
                        onClick={() => setSearchQuery('')}
                        variant="outline"
                      >
                        Limpiar búsqueda
                      </Button>
                      <Link href="/contact">
                        <Button className="gap-2">
                          <Mail className="h-4 w-4" />
                          Contactar Soporte
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredFAQs.map((faq) => {
                  const isExpanded = expandedItems.includes(faq.id);
                  const category = categories.find(c => c.id === faq.category);
                  
                  return (
                    <Card key={faq.id} className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-0">
                        <button
                          onClick={() => toggleExpanded(faq.id)}
                          className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {category && (
                                  <Badge variant="outline" className={`text-xs ${category.color}`}>
                                    {category.name}
                                  </Badge>
                                )}
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Star className="h-3 w-3" />
                                    {faq.helpful}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {faq.views} vistas
                                  </span>
                                </div>
                              </div>
                              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                {faq.question}
                              </h3>
                              {isExpanded && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <p className="text-gray-600 leading-relaxed">
                                    {faq.answer}
                                  </p>
                                  <div className="flex flex-wrap gap-2 mt-4">
                                    {faq.tags.map((tag, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex-shrink-0">
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Still Need Help */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-8 text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-blue-100 rounded-full">
                  <HelpCircle className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  ¿Aún necesitas ayuda?
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Si no encontraste la respuesta que buscabas, nuestro equipo de soporte 
                  está aquí para ayudarte. Contáctanos y te responderemos lo más pronto posible.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/contact">
                  <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Mail className="h-4 w-4" />
                    Contactar Soporte
                  </Button>
                </Link>
                <Link href="/forum">
                  <Button variant="outline" className="gap-2">
                    <Users className="h-4 w-4" />
                    Preguntar en el Foro
                  </Button>
                </Link>
                <Button variant="outline" className="gap-2">
                  <Phone className="h-4 w-4" />
                  +51 1 234-5678
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}