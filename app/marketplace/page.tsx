'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Coins, 
  ShoppingCart, 
  Star, 
  Clock, 
  Users,
  BookOpen,
  Trophy,
  Gift,
  Zap
} from 'lucide-react';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { CrolarsWallet } from '@/components/marketplace/CrolarsWallet';
import { PurchaseHistory } from '@/components/marketplace/PurchaseHistory';
import { ProductDetail } from '@/components/marketplace/ProductDetail';

// Mock data para productos del marketplace
const mockProducts = [
  {
    id: '1',
    name: 'Resumen de Cálculo Diferencial',
    description: 'Resumen completo con ejercicios resueltos y fórmulas principales',
    price: 150,
    category: 'Resúmenes',
    subject: 'Matemáticas',
    seller: {
      id: '1',
      name: 'Ana García',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
      rating: 4.8,
      sales: 45
    },
    rating: 4.9,
    reviews: 23,
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=calculus%20differential%20summary%20notes%20mathematics%20formulas%20clean%20academic%20style&image_size=square',
    tags: ['Cálculo', 'Matemáticas', 'Universidad'],
    createdAt: new Date('2024-01-15'),
    featured: true
  },
  {
    id: '2',
    name: 'Plantillas de Presentación Profesional',
    description: 'Pack de 20 plantillas PowerPoint para presentaciones académicas',
    price: 200,
    category: 'Plantillas',
    subject: 'General',
    seller: {
      id: '2',
      name: 'Carlos Mendez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
      rating: 4.6,
      sales: 32
    },
    rating: 4.7,
    reviews: 18,
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20presentation%20templates%20powerpoint%20academic%20clean%20modern%20design&image_size=square',
    tags: ['PowerPoint', 'Presentaciones', 'Profesional'],
    createdAt: new Date('2024-01-10'),
    featured: false
  },
  {
    id: '3',
    name: 'Guía de Laboratorio de Química Orgánica',
    description: 'Manual completo con procedimientos y análisis de resultados',
    price: 300,
    category: 'Guías',
    subject: 'Química',
    seller: {
      id: '3',
      name: 'María López',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      rating: 4.9,
      sales: 67
    },
    rating: 4.8,
    reviews: 31,
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=organic%20chemistry%20laboratory%20guide%20scientific%20equipment%20academic%20style&image_size=square',
    tags: ['Química', 'Laboratorio', 'Orgánica'],
    createdAt: new Date('2024-01-08'),
    featured: true
  },
  {
    id: '4',
    name: 'Acceso Premium 1 Mes',
    description: 'Acceso completo a todas las funciones premium de CRUNEVO',
    price: 500,
    category: 'Premium',
    subject: 'General',
    seller: {
      id: 'admin',
      name: 'CRUNEVO',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CRUNEVO',
      rating: 5.0,
      sales: 234
    },
    rating: 4.9,
    reviews: 89,
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20access%20badge%20golden%20crown%20luxury%20academic%20platform&image_size=square',
    tags: ['Premium', 'Acceso', 'Beneficios'],
    createdAt: new Date('2024-01-01'),
    featured: true
  },
  {
    id: '5',
    name: 'Pack de Íconos Académicos',
    description: 'Colección de 100 íconos vectoriales para proyectos académicos',
    price: 100,
    category: 'Recursos',
    subject: 'Diseño',
    seller: {
      id: '4',
      name: 'Diego Silva',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diego',
      rating: 4.5,
      sales: 28
    },
    rating: 4.6,
    reviews: 15,
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=academic%20icons%20pack%20vector%20design%20educational%20symbols%20clean%20style&image_size=square',
    tags: ['Íconos', 'Diseño', 'Vectorial'],
    createdAt: new Date('2024-01-12'),
    featured: false
  }
];

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedSubject, setSelectedSubject] = useState('Todas');
  const [sortBy, setSortBy] = useState('featured');
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const categories = ['Todas', 'Resúmenes', 'Plantillas', 'Guías', 'Premium', 'Recursos'];
  const subjects = ['Todas', 'Matemáticas', 'Química', 'Física', 'Historia', 'Literatura', 'Diseño', 'General'];

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
  };

  const handleBackToMarketplace = () => {
    setSelectedProductId(null);
  };

  // Si hay un producto seleccionado, mostrar ProductDetail
  if (selectedProductId) {
    const selectedProduct = mockProducts.find(p => p.id === selectedProductId);
    if (selectedProduct) {
      return (
        <ProductDetail 
          product={selectedProduct} 
          onBack={handleBackToMarketplace}
        />
      );
    }
  }

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'Todas' || product.category === selectedCategory;
    const matchesSubject = selectedSubject === 'Todas' || product.subject === selectedSubject;
    
    return matchesSearch && matchesCategory && matchesSubject;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.createdAt.getTime() - a.createdAt.getTime();
      case 'featured':
      default:
        return b.featured ? 1 : -1;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <Coins className="inline-block w-10 h-10 text-yellow-500 mr-3" />
            Marketplace CRUNEVO
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Intercambia conocimiento y recursos académicos usando Crolars
          </p>
        </div>

        {/* Wallet Component */}
        <div className="mb-8">
          <CrolarsWallet />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Explorar
            </TabsTrigger>
            <TabsTrigger value="sell" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Vender
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Historial
            </TabsTrigger>
          </TabsList>

          {/* Browse Tab */}
          <TabsContent value="browse">
            {/* Filters */}
            <Card className="bg-white/70 backdrop-blur-sm mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar productos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Materia" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Destacados</SelectItem>
                      <SelectItem value="newest">Más recientes</SelectItem>
                      <SelectItem value="rating">Mejor valorados</SelectItem>
                      <SelectItem value="price-low">Precio: menor a mayor</SelectItem>
                      <SelectItem value="price-high">Precio: mayor a menor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Featured Products */}
            {filteredProducts.some(p => p.featured) && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-500" />
                  Productos Destacados
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                  {filteredProducts.filter(p => p.featured).map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onClick={() => handleProductSelect(product.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Products */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Todos los Productos ({filteredProducts.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {filteredProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onClick={() => handleProductSelect(product.id)}
                  />
                ))}
              </div>
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-gray-500">
                  Intenta ajustar los filtros de búsqueda
                </p>
              </div>
            )}
          </TabsContent>

          {/* Sell Tab */}
          <TabsContent value="sell">
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6" />
                  Vender en el Marketplace
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Gift className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    ¡Comparte tu conocimiento!
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Sube tus resúmenes, guías, plantillas y otros recursos académicos para ganar Crolars
                  </p>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Zap className="w-4 h-4 mr-2" />
                    Comenzar a Vender
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <PurchaseHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}