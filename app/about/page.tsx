'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Target, Eye, Heart, Award, BookOpen, MessageSquare, ShoppingBag, Trophy, Star } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const features = [
    {
      icon: BookOpen,
      title: 'Biblioteca de Apuntes',
      description: 'Accede y comparte apuntes de calidad con toda la comunidad estudiantil.'
    },
    {
      icon: MessageSquare,
      title: 'Foro Estudiantil',
      description: 'Conecta con otros estudiantes, resuelve dudas y participa en discusiones académicas.'
    },
    {
      icon: ShoppingBag,
      title: 'Marketplace',
      description: 'Compra y vende libros, materiales y servicios entre estudiantes.'
    },
    {
      icon: Trophy,
      title: 'Gamificación',
      description: 'Gana Crolars y desbloquea logros mientras participas en la plataforma.'
    }
  ];

  const values = [
    {
      icon: Users,
      title: 'Comunidad',
      description: 'Creemos en el poder de la colaboración estudiantil y el apoyo mutuo.'
    },
    {
      icon: Star,
      title: 'Excelencia',
      description: 'Promovemos la calidad académica y el crecimiento personal continuo.'
    },
    {
      icon: Heart,
      title: 'Inclusión',
      description: 'Construimos un espacio donde todos los estudiantes se sientan bienvenidos.'
    },
    {
      icon: Award,
      title: 'Innovación',
      description: 'Utilizamos tecnología para mejorar la experiencia educativa universitaria.'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Estudiantes Activos' },
    { number: '50,000+', label: 'Apuntes Compartidos' },
    { number: '25+', label: 'Universidades' },
    { number: '100+', label: 'Carreras Representadas' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            Plataforma Estudiantil Líder en Perú
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Acerca de <span className="text-blue-600">CRUNEVO</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Somos la plataforma estudiantil que conecta a universitarios peruanos, 
            facilitando el intercambio de conocimiento y creando una comunidad académica sólida.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Target className="w-8 h-8 text-blue-600" />
                Nuestra Misión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed text-lg">
                Democratizar el acceso al conocimiento universitario en Perú, 
                creando una plataforma donde los estudiantes puedan colaborar, 
                aprender y crecer juntos, sin importar su universidad o carrera.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Eye className="w-8 h-8 text-purple-600" />
                Nuestra Visión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed text-lg">
                Ser la red estudiantil más grande de Latinoamérica, 
                transformando la manera en que los universitarios se conectan, 
                estudian y se preparan para su futuro profesional.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Qué Ofrecemos?</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              CRUNEVO integra todas las herramientas que necesitas para tu vida universitaria
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nuestros Valores</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Los principios que guían cada decisión y desarrollo en CRUNEVO
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm text-center">
                  <CardHeader>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <IconComponent className="w-6 h-6 text-purple-600" />
                    </div>
                    <CardTitle className="text-lg">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Story Section */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mb-16">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Nuestra Historia</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none">
            <div className="text-gray-700 space-y-4">
              <p>
                CRUNEVO nació en 2024 con una visión clara: crear la primera plataforma 
                estudiantil integral diseñada específicamente para universitarios peruanos. 
                Reconocimos que los estudiantes necesitaban más que solo redes sociales 
                tradicionales; necesitaban un espacio dedicado al crecimiento académico y profesional.
              </p>
              <p>
                Comenzamos como un proyecto universitario y rápidamente evolucionamos hacia 
                una plataforma completa que integra biblioteca de apuntes, foros de discusión, 
                marketplace estudiantil y un sistema de gamificación único con nuestra moneda 
                virtual "Crolars".
              </p>
              <p>
                Hoy, CRUNEVO conecta a miles de estudiantes de diferentes universidades 
                peruanas, facilitando el intercambio de conocimiento y creando oportunidades 
                de colaboración que trascienden las barreras institucionales.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Team Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Nuestro Equipo</h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Un grupo diverso de profesionales comprometidos con la educación y la tecnología
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">ED</span>
                </div>
                <h3 className="font-bold text-lg mb-2">Equipo de Desarrollo</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Ingenieros y diseñadores especializados en tecnologías web modernas
                </p>
                <Badge variant="secondary">Tecnología</Badge>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">EA</span>
                </div>
                <h3 className="font-bold text-lg mb-2">Equipo Académico</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Educadores y especialistas en pedagogía universitaria
                </p>
                <Badge variant="secondary">Educación</Badge>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">EC</span>
                </div>
                <h3 className="font-bold text-lg mb-2">Equipo de Comunidad</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Especialistas en gestión de comunidades y experiencia de usuario
                </p>
                <Badge variant="secondary">Comunidad</Badge>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center">
          <CardContent className="py-12">
            <h2 className="text-3xl font-bold mb-4">¿Listo para Unirte a CRUNEVO?</h2>
            <p className="text-xl mb-8 opacity-90">
              Forma parte de la comunidad estudiantil más grande de Perú
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                  Crear Cuenta Gratis
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Contáctanos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}