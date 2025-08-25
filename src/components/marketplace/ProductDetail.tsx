'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import { Textarea } from '@/src/components/ui/textarea';
import { 
  ArrowLeft,
  Heart,
  Share2,
  Download,
  Star,
  Eye,
  MessageCircle,
  Flag,
  Coins,
  Calendar,
  FileText,
  Image as ImageIcon,
  Video,
  Archive,
  Shield,
  Award,
  Users,
  ThumbsUp,
  Send
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Product {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  category: string;
  subject: string;
  seller: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    totalSales: number;
    joinDate: Date;
    verified: boolean;
  };
  images: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
  isFeatured: boolean;
  isLiked: boolean;
  fileType: string;
  fileSize: string;
  pageCount?: number;
  language: string;
  level: string;
  preview?: string;
}

interface Review {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  rating: number;
  comment: string;
  createdAt: Date;
  helpful: number;
}

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
}

export function ProductDetail({ product, onBack }: ProductDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(product.isLiked);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Mock reviews data
  const mockReviews: Review[] = [
    {
      id: '1',
      user: {
        name: 'Carlos Mendez',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos'
      },
      rating: 5,
      comment: 'Excelente material, muy bien organizado y fácil de entender. Me ayudó mucho para mi examen.',
      createdAt: new Date('2024-01-10T14:30:00'),
      helpful: 12
    },
    {
      id: '2',
      user: {
        name: 'María López',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria'
      },
      rating: 4,
      comment: 'Buen contenido, aunque podría tener más ejemplos prácticos.',
      createdAt: new Date('2024-01-08T09:15:00'),
      helpful: 8
    },
    {
      id: '3',
      user: {
        name: 'Ana García',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana'
      },
      rating: 5,
      comment: 'Perfecto para repasar antes del examen. Muy recomendado.',
      createdAt: new Date('2024-01-05T16:45:00'),
      helpful: 15
    }
  ];

  const displayedReviews = showAllReviews ? mockReviews : mockReviews.slice(0, 2);

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handlePurchase = () => {
    // Implementar lógica de compra
    console.log('Purchasing product:', product.id);
  };

  const handleShare = () => {
    // Implementar lógica de compartir
    navigator.share?.({
      title: product.name,
      text: product.description,
      url: window.location.href
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Resúmenes': 'bg-blue-50 text-blue-700 border-blue-200',
      'Plantillas': 'bg-green-50 text-green-700 border-green-200',
      'Guías': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'Recursos': 'bg-pink-50 text-pink-700 border-pink-200',
      'Ejercicios': 'bg-orange-50 text-orange-700 border-orange-200'
    };
    return colors[category] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getSubjectColor = (subject: string) => {
    const colors: { [key: string]: string } = {
      'Matemáticas': 'bg-purple-50 text-purple-700',
      'Física': 'bg-blue-50 text-blue-700',
      'Química': 'bg-green-50 text-green-700',
      'Biología': 'bg-emerald-50 text-emerald-700',
      'Historia': 'bg-amber-50 text-amber-700',
      'Literatura': 'bg-rose-50 text-rose-700'
    };
    return colors[subject] || 'bg-gray-50 text-gray-700';
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      default:
        return <Archive className="w-4 h-4" />;
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating
                ? 'text-yellow-500 fill-yellow-500'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Detalles del Producto</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Images */}
        <div className="lg:col-span-2">
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              {/* Main Image */}
              <div className="mb-4">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={product.images[selectedImageIndex]} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Image Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImageIndex === index
                          ? 'border-purple-500'
                          : 'border-gray-200'
                      }`}
                    >
                      <img 
                        src={image} 
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Description */}
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-4">
                {product.longDescription}
              </p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Info & Purchase */}
        <div className="space-y-6">
          {/* Product Info */}
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <p className="text-gray-600 mb-4">{product.description}</p>
                
                <div className="flex items-center gap-2 mb-4">
                  <Badge className={getCategoryColor(product.category)}>
                    {product.category}
                  </Badge>
                  <Badge variant="outline" className={getSubjectColor(product.subject)}>
                    {product.subject}
                  </Badge>
                  {product.isFeatured && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      <Award className="w-3 h-3 mr-1" />
                      Destacado
                    </Badge>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  {renderStars(product.rating, 'md')}
                  <span className="text-lg font-semibold">{product.rating}</span>
                  <span className="text-gray-500">({product.reviewCount} reseñas)</span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 mb-6">
                  <Coins className="w-6 h-6 text-yellow-500" />
                  <span className="text-3xl font-bold text-gray-900">{product.price}</span>
                  <span className="text-gray-500">Crolars</span>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <Button 
                    onClick={handlePurchase}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    size="lg"
                  >
                    <Coins className="w-5 h-5 mr-2" />
                    Comprar Ahora
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleLike}
                      className={`flex-1 ${
                        isLiked ? 'text-red-600 border-red-300' : ''
                      }`}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-red-600' : ''}`} />
                      {isLiked ? 'Guardado' : 'Guardar'}
                    </Button>
                    
                    <Button variant="outline" onClick={handleShare}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                    
                    <Button variant="outline">
                      <Flag className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Info */}
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Información del Archivo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <div className="flex items-center gap-2">
                    {getFileIcon(product.fileType)}
                    <span className="font-medium">{product.fileType.toUpperCase()}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tamaño:</span>
                  <span className="font-medium">{product.fileSize}</span>
                </div>
                
                {product.pageCount && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Páginas:</span>
                    <span className="font-medium">{product.pageCount}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Idioma:</span>
                  <span className="font-medium">{product.language}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Nivel:</span>
                  <span className="font-medium">{product.level}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Descargas:</span>
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{product.downloadCount}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seller Info */}
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Vendedor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 mb-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={product.seller.avatar} alt={product.seller.name} />
                  <AvatarFallback className="bg-purple-100 text-purple-600">
                    {product.seller.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{product.seller.name}</h3>
                    {product.seller.verified && (
                      <Shield className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(product.seller.rating)}
                    <span className="text-sm text-gray-600">({product.seller.rating})</span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{product.seller.totalSales} ventas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Desde {formatDistanceToNow(product.seller.joinDate, { locale: es })}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contactar Vendedor
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reviews Section */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Reseñas ({product.reviewCount})</span>
            <div className="flex items-center gap-2">
              {renderStars(product.rating, 'md')}
              <span className="text-lg font-semibold">{product.rating}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add Review */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3">Escribir una reseña</h4>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-gray-600">Calificación:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setNewRating(star)}
                    className="p-1"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= newRating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              placeholder="Comparte tu experiencia con este producto..."
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              className="mb-3"
            />
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Send className="w-4 h-4 mr-2" />
              Publicar Reseña
            </Button>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {displayedReviews.map((review) => (
              <div key={review.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={review.user.avatar} alt={review.user.name} />
                    <AvatarFallback className="bg-purple-100 text-purple-600">
                      {review.user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{review.user.name}</h4>
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(review.createdAt, { addSuffix: true, locale: es })}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{review.comment}</p>
                    
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" className="text-gray-600">
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Útil ({review.helpful})
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-600">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Responder
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {mockReviews.length > 2 && (
            <div className="text-center mt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowAllReviews(!showAllReviews)}
              >
                {showAllReviews ? 'Ver menos reseñas' : `Ver todas las reseñas (${mockReviews.length})`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}