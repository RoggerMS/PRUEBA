"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, Search, ArrowLeft, BookOpen, Users, MessageSquare, ShoppingBag, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const popularPages = [
    { name: "Biblioteca de Apuntes", href: "/notes", icon: BookOpen, description: "Encuentra apuntes de todos los cursos" },
    { name: "Foro Estudiantil", href: "/forum", icon: MessageSquare, description: "Participa en discusiones académicas" },
    { name: "Marketplace", href: "/marketplace", icon: ShoppingBag, description: "Compra y vende recursos académicos" },
    { name: "Clubes", href: "/clubs", icon: Users, description: "Únete a clubes estudiantiles" },
    { name: "Ayuda", href: "/help", icon: HelpCircle, description: "Centro de ayuda y FAQ" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-100 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-8">
        {/* Main 404 Content */}
        <div className="text-center space-y-6">
          {/* 404 Illustration */}
          <div className="relative">
            <div className="text-9xl font-bold text-red-200 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="p-4 bg-red-100 rounded-full">
                <Search className="h-12 w-12 text-red-600" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
              ¡Oops! Página no encontrada
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              La página que buscas no existe o ha sido movida. 
              Pero no te preocupes, ¡hay mucho más que explorar en CRUNEVO!
            </p>
          </div>

          {/* Search Bar */}
          <Card className="bg-white/80 backdrop-blur-sm border-red-200 max-w-md mx-auto">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="text-left">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    ¿Qué estás buscando?
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Buscar apuntes, cursos, foros..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                  Buscar en CRUNEVO
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                Ir al Inicio
              </Button>
            </Link>
            <Button variant="outline" onClick={() => router.back()} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver Atrás
            </Button>
          </div>
        </div>

        {/* Popular Pages */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Páginas Populares
            </h2>
            <p className="text-gray-600">
              Explora las secciones más visitadas de CRUNEVO
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularPages.map((page, index) => {
              const Icon = page.icon;
              return (
                <Link key={index} href={page.href}>
                  <Card className="bg-white/80 backdrop-blur-sm border-gray-200 hover:border-purple-300 transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer h-full">
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="flex justify-center">
                        <div className="p-3 bg-purple-100 rounded-full">
                          <Icon className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2">
                          {page.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {page.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Help Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
          <CardContent className="p-8 text-center space-y-4">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <HelpCircle className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              ¿Necesitas ayuda?
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Si crees que esta página debería existir o tienes problemas técnicos, 
              no dudes en contactarnos. Nuestro equipo está aquí para ayudarte.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link href="/contact">
                <Button variant="outline" className="gap-2">
                  Contactar Soporte
                </Button>
              </Link>
              <Link href="/help">
                <Button variant="outline" className="gap-2">
                  Centro de Ayuda
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer Message */}
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">
            Error 404 - Página no encontrada | CRUNEVO - Plataforma Estudiantil Universitaria
          </p>
        </div>
      </div>
    </div>
  );
}