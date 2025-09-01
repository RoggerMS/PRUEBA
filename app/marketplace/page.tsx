'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { 
  Search, 
  ShoppingCart, 
  Star, 
  Gift,
  Zap,
  BarChart3,
  Filter
} from 'lucide-react';
import ProductCard from '@/components/marketplace/ProductCard';
import ProductDetail from '@/components/marketplace/ProductDetail';
import SellProductModal from '@/components/marketplace/SellProductModal';
import CategoryFilter from '@/components/marketplace/CategoryFilter';
import MarketplaceStats from '@/components/marketplace/MarketplaceStats';
// Import ShoppingCart as a named export to ensure the component is defined
// correctly when rendered in the page.
import { ShoppingCart as ShoppingCartComponent } from '@/components/marketplace/ShoppingCart';

// Mock data para productos del marketplace
const mockProducts = [
  {
    id: '1',
    name: 'Resumen de Cálculo Diferencial',
    description: 'Resumen completo con ejercicios resueltos y fórmulas principales',
    price: 25,
    priceInSoles: 95,
    category: 'Resúmenes',
    subcategory: 'Matemáticas Avanzadas',
    seller: {
      id: '1',
      name: 'Ana García',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
      rating: 4.8,
      sales: 45,
      verified: true
    },
    rating: 4.9,
    ratingCount: 23,
    stock: 50,
    sold: 120,
    views: 450,
    isFeatured: true,
    favoriteCount: 34,
    reviewCount: 23,
    images: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=calculus%20differential%20summary%20notes%20mathematics%20formulas%20clean%20academic%20style&image_size=square',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=mathematical%20equations%20derivatives%20formulas%20notebook%20academic%20style&image_size=square',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=calculus%20graphs%20functions%20mathematical%20diagrams%20educational&image_size=square'
    ],
    tags: ['Cálculo', 'Matemáticas', 'Universidad'],
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Plantillas de Presentación Profesional',
    description: 'Pack de 20 plantillas PowerPoint para presentaciones académicas',
    price: 35,
    priceInSoles: 133,
    category: 'Plantillas',
    subcategory: 'Presentaciones',
    seller: {
      id: '2',
      name: 'Carlos Mendez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
      rating: 4.6,
      sales: 32,
      verified: true
    },
    rating: 4.7,
    ratingCount: 18,
    stock: 25,
    sold: 90,
    views: 300,
    isFeatured: false,
    favoriteCount: 12,
    reviewCount: 18,
    images: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20presentation%20templates%20powerpoint%20academic%20clean%20modern%20design&image_size=square',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=business%20presentation%20slides%20template%20corporate%20design%20professional&image_size=square'
    ],
    tags: ['PowerPoint', 'Presentaciones', 'Profesional'],
    createdAt: new Date('2024-01-10')
  },
  {
    id: '3',
    name: 'Guía de Laboratorio de Química Orgánica',
    description: 'Manual completo con procedimientos y análisis de resultados',
    price: 45,
    priceInSoles: 171,
    category: 'Guías',
    subcategory: 'Química Orgánica',
    seller: {
      id: '3',
      name: 'María López',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      rating: 4.9,
      sales: 67,
      verified: true
    },
    rating: 4.8,
    ratingCount: 31,
    stock: 30,
    sold: 150,
    views: 500,
    isFeatured: true,
    favoriteCount: 45,
    reviewCount: 31,
    images: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=organic%20chemistry%20laboratory%20guide%20scientific%20equipment%20academic%20style&image_size=square',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=chemistry%20lab%20equipment%20beakers%20molecules%20scientific%20illustration&image_size=square',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=organic%20chemistry%20molecular%20structures%20formulas%20educational%20diagram&image_size=square'
    ],
    tags: ['Química', 'Laboratorio', 'Orgánica'],
    createdAt: new Date('2024-01-08')
  },
  {
    id: '4',
    name: 'Acceso Premium 1 Mes',
    description: 'Acceso completo a todas las funciones premium de CRUNEVO',
    price: 89,
    priceInSoles: 338,
    category: 'Premium',
    subcategory: 'Suscripciones',
    seller: {
      id: 'admin',
      name: 'CRUNEVO',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CRUNEVO',
      rating: 5.0,
      sales: 234,
      verified: true
    },
    rating: 4.9,
    ratingCount: 89,
    stock: 999,
    sold: 400,
    views: 1000,
    isFeatured: true,
    favoriteCount: 78,
    reviewCount: 89,
    images: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20access%20badge%20golden%20crown%20luxury%20academic%20platform&image_size=square',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20features%20dashboard%20academic%20platform%20exclusive%20access&image_size=square'
    ],
    tags: ['Premium', 'Acceso', 'Beneficios'],
    createdAt: new Date('2024-01-01')
  },
  {
    id: '5',
    name: 'Pack de Íconos Académicos',
    description: 'Colección de 100 íconos vectoriales para proyectos académicos',
    price: 18,
    priceInSoles: 68,
    category: 'Recursos',
    subcategory: 'Diseño Gráfico',
    seller: {
      id: '4',
      name: 'Diego Silva',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diego',
      rating: 4.5,
      sales: 28,
      verified: false
    },
    rating: 4.6,
    ratingCount: 15,
    stock: 40,
    sold: 60,
    views: 200,
    isFeatured: false,
    favoriteCount: 8,
    reviewCount: 15,
    images: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=academic%20icons%20pack%20vector%20design%20educational%20symbols%20clean%20style&image_size=square',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=educational%20icons%20collection%20school%20university%20symbols%20vector&image_size=square',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=academic%20vector%20icons%20books%20graduation%20science%20symbols&image_size=square'
    ],
    tags: ['Íconos', 'Diseño', 'Vectorial'],
    createdAt: new Date('2024-01-12')
  }
];

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedSubcategory, setSelectedSubcategory] = useState('Todas');
  const [sortBy, setSortBy] = useState('featured');
  const [activeTab, setActiveTab] = useState('products');

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  
  // Estado del carrito
  const [cartItems, setCartItems] = useState<Array<{id: string, quantity: number}>>([]);
  const [showCart, setShowCart] = useState(false);

  const categories = [
    { id: 'all', name: 'Todas', subcategories: [] },
    { id: 'resumenes', name: 'Resúmenes', subcategories: ['Matemáticas Avanzadas', 'Ciencias Básicas', 'Humanidades'] },
    { id: 'plantillas', name: 'Plantillas', subcategories: ['Presentaciones', 'Documentos', 'Infografías'] },
    { id: 'guias', name: 'Guías', subcategories: ['Química Orgánica', 'Física Aplicada', 'Metodología'] },
    { id: 'premium', name: 'Premium', subcategories: ['Suscripciones', 'Accesos Especiales'] },
    { id: 'recursos', name: 'Recursos', subcategories: ['Diseño Gráfico', 'Multimedia', 'Software'] }
  ];

  // Funciones del carrito
  const addToCart = (productId: string, quantity: number = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === productId);
      if (existingItem) {
        return prev.map(item => 
          item.id === productId 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { id: productId, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev => 
      prev.map(item => 
        item.id === productId 
          ? { ...item, quantity }
          : item
      )
    );
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const product = mockProducts.find(p => p.id === item.id);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const getCartTotalInSoles = () => {
    return cartItems.reduce((total, item) => {
      const product = mockProducts.find(p => p.id === item.id);
      return total + (product ? product.priceInSoles * item.quantity : 0);
    }, 0);
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
  };

  const handleBackToMarketplace = () => {
    setSelectedProductId(null);
  };

  const handleSellProduct = () => {
    setShowSellModal(true);
  };

  const handleSellModalClose = () => {
    setShowSellModal(false);
  };

  const handleProductSubmit = (productData: any) => {
    console.log('Nuevo producto:', productData);
    // Aquí se implementaría la lógica para enviar el producto al backend
    setShowSellModal(false);
  };

  const handleCategorySelect = (categoryName: string, subcategory?: string) => {
    setSelectedCategory(categoryName);
    if (subcategory) {
      setSelectedSubcategory(subcategory);
    } else {
      setSelectedSubcategory('Todas');
    }
    setShowCategoryFilter(false);
  };

  const handleAddToCart = (productId: string) => {
    addToCart(productId);
    // Mostrar notificación o feedback visual
  };

  const handleCheckout = () => {
    console.log('Procesando compra:', cartItems);
    // Aquí se implementaría la lógica de checkout
  };

  // Transform simple cart items into detailed items expected by ShoppingCart
  // component by merging with product information.
  const cartItemsDetailed = cartItems
    .map((item) => {
      const product = mockProducts.find((p) => p.id === item.id);
      if (!product) return null;
      return {
        id: item.id,
        productId: product.id,
        productName: product.name,
        productImage: product.images[0],
        price: product.price,
        priceInSoles: product.priceInSoles,
        quantity: item.quantity,
        stock: product.stock,
        seller: product.seller,
      };
    })
    .filter(Boolean) as Array<{
      id: string;
      productId: string;
      productName: string;
      productImage: string;
      price: number;
      priceInSoles: number;
      quantity: number;
      stock: number;
      seller: { id: string; name: string; avatar?: string };
    }>;

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
    const matchesSubcategory = selectedSubcategory === 'Todas' || product.subcategory === selectedSubcategory;
    
    return matchesSearch && matchesCategory && matchesSubcategory;
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
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <ShoppingCart className="inline-block w-10 h-10 text-purple-600 mr-3" />
            Marketplace CRUNEVO
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Compra y vende recursos académicos de calidad
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowCategoryFilter(!showCategoryFilter)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowCart(true)}
              variant="outline"
              className="relative"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Carrito ({cartItems.length})
              {cartItems.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </Badge>
              )}
            </Button>
            <Button 
              onClick={handleSellProduct}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 text-lg font-semibold"
            >
              <Zap className="w-5 h-5 mr-2" />
              Vender Producto
            </Button>
          </div>
        </div>

        {/* Category Filter */}
        {showCategoryFilter && (
          <div className="mb-6">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onCategorySelect={handleCategorySelect}
            />
          </div>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Productos
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Estadísticas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">

        {/* Main Content */}
        <div>
            {/* Filters */}
            <Card className="bg-white/80 backdrop-blur-sm mb-6 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  {/* Search Bar - Full width on mobile */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar productos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 text-base"
                    />
                  </div>
                  
                  {/* Filter Controls - Responsive grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Subcategoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Todas">Todas</SelectItem>
                        {categories
                          .find(cat => cat.name === selectedCategory)
                          ?.subcategories.map(subcategory => (
                            <SelectItem key={subcategory} value={subcategory}>
                              {subcategory}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-12">
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
                </div>
              </CardContent>
            </Card>

            {/* Featured Products */}
            {filteredProducts.some(p => p.isFeatured) && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-500" />
                  Productos Destacados
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                  {filteredProducts.filter(p => p.isFeatured).map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onClick={() => handleProductSelect(product.id)}
                      onAddToCart={handleAddToCart}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                {filteredProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onClick={() => handleProductSelect(product.id)}
                    onAddToCart={handleAddToCart}
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
        </div>
          </TabsContent>

          <TabsContent value="stats">
            <MarketplaceStats />
          </TabsContent>
        </Tabs>
      </div>

      {/* Shopping Cart Modal */}
      <ShoppingCartComponent
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        items={cartItemsDetailed}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
      />

      {/* Sell Product Modal */}
      <SellProductModal 
        isOpen={showSellModal}
        onClose={handleSellModalClose}
        onSubmit={handleProductSubmit}
      />
    </div>
  );
}