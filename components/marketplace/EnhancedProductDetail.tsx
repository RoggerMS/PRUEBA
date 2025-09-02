'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Star, 
  Heart, 
  Eye, 
  ShoppingCart, 
  MessageCircle,
  UserPlus,
  UserCheck,
  Share2,
  Flag,
  Zap,
  Shield,
  Truck,
  RotateCcw,
  Award,
  Clock,
  MapPin,
  Send,
  Plus,
  Minus
} from 'lucide-react';
import { useState } from 'react';
import { formatPrice } from '@/shared/constants/currency';
import { useEnhancedMarketplace } from '@/hooks/useEnhancedMarketplace';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface EnhancedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  priceInSoles?: number;
  rating: number;
  ratingCount: number;
  views: number;
  stock: number;
  sold: number;
  category: string;
  subcategory?: string;
  seller?: {
    id: string;
    name: string;
    username: string;
    image?: string;
    verified: boolean;
    rating?: number;
    totalSales?: number;
    isFollowing?: boolean;
    location?: string;
    joinedAt?: Date | string;
    responseTime?: string;
  } | null;
  images: string[];
  tags?: string[] | string;
  createdAt: Date | string;
  isFeatured: boolean;
  favoriteCount?: number;
  reviewCount?: number;
  specifications?: Record<string, string>;
  shippingInfo?: {
    freeShipping: boolean;
    estimatedDays: number;
    cost?: number;
  };
  returnPolicy?: {
    returnsAccepted: boolean;
    returnDays: number;
  };
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  rating: number;
  comment: string;
  createdAt: Date | string;
  helpful: number;
  images?: string[];
  verified: boolean;
}

interface EnhancedProductDetailProps {
  product: EnhancedProduct;
  reviews?: Review[];
  onClose?: () => void;
}

export const EnhancedProductDetail: React.FC<EnhancedProductDetailProps> = ({ 
  product, 
  reviews = [], 
  onClose 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [quantity, setQuantity] = useState(1);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  
  const { data: session } = useSession();
  const {
    toggleFavorite,
    toggleFollowSeller,
    addToCart,
    contactSeller,
    addReview,
    isFavorite,
    isFollowingSeller,
    isInCart,
    getCartQuantity,
    loading
  } = useEnhancedMarketplace();

  const handleLike = async () => {
    await toggleFavorite(product.id);
  };

  const handleFollowSeller = async () => {
    if (product.seller) {
      await toggleFollowSeller(product.seller.id);
    }
  };

  const handleAddToCart = async () => {
    await addToCart(product.id, quantity);
  };

  const handleContactSeller = async () => {
    if (!session?.user) {
      toast.error('Debes iniciar sesión para contactar vendedores');
      return;
    }
    
    if (!product.seller) {
      toast.error('Información del vendedor no disponible');
      return;
    }

    if (!contactMessage.trim()) {
      toast.error('Por favor escribe un mensaje');
      return;
    }
    
    const success = await contactSeller(product.seller.id, product.id, contactMessage);
    if (success) {
      setShowContactModal(false);
      setContactMessage('');
    }
  };

  const handleSubmitReview = async () => {
    if (!session?.user) {
      toast.error('Debes iniciar sesión para dejar una reseña');
      return;
    }

    if (!reviewComment.trim()) {
      toast.error('Por favor escribe un comentario');
      return;
    }

    const success = await addReview(product.id, reviewRating, reviewComment);
    if (success) {
      setShowReviewModal(false);
      setReviewComment('');
      setReviewRating(5);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  const handleReport = () => {
    toast.info('Función de reporte en desarrollo');
  };

  const formatPriceDisplay = (price: number, priceInSoles?: number) => {
    if (price === 0) return 'Gratis';
    if (priceInSoles) {
      return `S/ ${priceInSoles.toFixed(2)}`;
    }
    return formatPrice(price, false);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number, size = 'w-4 h-4') => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${size} ${
          i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const isProductFavorite = isFavorite(product.id);
  const isSellerFollowed = product.seller ? isFollowingSeller(product.seller.id) : false;
  const productInCart = isInCart(product.id);
  const cartQuantity = getCartQuantity(product.id);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            {product.category}
          </Badge>
          {product.subcategory && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {product.subcategory}
            </Badge>
          )}
          {product.isFeatured && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              <Star className="w-3 h-3 mr-1" />
              Destacado
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-1" />
            Compartir
          </Button>
          <Button variant="outline" size="sm" onClick={handleReport}>
            <Flag className="w-4 h-4 mr-1" />
            Reportar
          </Button>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Cerrar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg overflow-hidden relative">
            <img
              src={product.images[currentImageIndex]?.startsWith('http') 
                ? product.images[currentImageIndex] 
                : `http://localhost:3001${product.images[currentImageIndex]}`
              }
              alt={product.name}
              className="w-full h-full object-cover"
            />
            
            {/* Navigation arrows */}
            {product.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={() => setCurrentImageIndex((prev) => 
                    prev === 0 ? product.images.length - 1 : prev - 1
                  )}
                >
                  ←
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={() => setCurrentImageIndex((prev) => 
                    (prev + 1) % product.images.length
                  )}
                >
                  →
                </Button>
              </>
            )}
          </div>
          
          {/* Image thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex 
                      ? 'border-purple-500' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img
                    src={image.startsWith('http') ? image : `http://localhost:3001${image}`}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Title and Price */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl font-bold text-purple-600">
                {formatPriceDisplay(product.price, product.priceInSoles)}
              </div>
              {product.price > 0 && product.priceInSoles && (
                <div className="text-lg text-gray-500 line-through">
                  ${product.price.toFixed(2)}
                </div>
              )}
            </div>
          </div>

          {/* Rating and Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              {renderStars(product.rating)}
              <span className="font-medium ml-1">{product.rating.toFixed(1)}</span>
              <span className="text-gray-400">({product.ratingCount} reseñas)</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{formatNumber(product.views)} vistas</span>
            </div>
            <div className="flex items-center gap-1">
              <ShoppingCart className="w-4 h-4" />
              <span>{formatNumber(product.sold)} vendidos</span>
            </div>
          </div>

          {/* Stock and Quantity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Stock disponible:</span>
              <span className={`font-medium ${
                product.stock > 10 ? 'text-green-600' : 
                product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {product.stock > 0 ? `${product.stock} unidades` : 'Agotado'}
              </span>
            </div>
            
            {product.stock > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Cantidad:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    className="w-16 text-center"
                    min={1}
                    max={product.stock}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button 
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                onClick={handleAddToCart}
                disabled={loading || product.stock === 0}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {productInCart ? `Agregar más (${cartQuantity} en carrito)` : 'Agregar al carrito'}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleLike}
                disabled={loading}
                className={isProductFavorite ? 'text-red-500 border-red-500' : ''}
              >
                <Heart className={`w-4 h-4 ${isProductFavorite ? 'fill-current' : ''}`} />
              </Button>
            </div>
            
            {product.seller && session?.user?.id !== product.seller.id && (
              <div className="flex gap-3">
                <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contactar vendedor
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Contactar a {product.seller.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Escribe tu mensaje aquí..."
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        rows={4}
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleContactSeller} disabled={loading}>
                          <Send className="w-4 h-4 mr-2" />
                          Enviar mensaje
                        </Button>
                        <Button variant="outline" onClick={() => setShowContactModal(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button
                  variant="outline"
                  onClick={handleFollowSeller}
                  disabled={loading}
                  className={isSellerFollowed ? 'text-blue-600 border-blue-600' : ''}
                >
                  {isSellerFollowed ? (
                    <UserCheck className="w-4 h-4 mr-2" />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-2" />
                  )}
                  {isSellerFollowed ? 'Siguiendo' : 'Seguir'}
                </Button>
              </div>
            )}
          </div>

          {/* Shipping and Return Info */}
          {(product.shippingInfo || product.returnPolicy) && (
            <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
              {product.shippingInfo && (
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="w-4 h-4 text-green-600" />
                  <span>
                    {product.shippingInfo.freeShipping ? 'Envío gratis' : `Envío: ${formatPrice(product.shippingInfo.cost || 0)}`}
                    {' • '}
                    Entrega en {product.shippingInfo.estimatedDays} días
                  </span>
                </div>
              )}
              {product.returnPolicy && (
                <div className="flex items-center gap-2 text-sm">
                  <RotateCcw className="w-4 h-4 text-blue-600" />
                  <span>
                    {product.returnPolicy.returnsAccepted 
                      ? `Devoluciones aceptadas hasta ${product.returnPolicy.returnDays} días`
                      : 'No se aceptan devoluciones'
                    }
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="description">Descripción</TabsTrigger>
          <TabsTrigger value="reviews">Reseñas ({reviews.length})</TabsTrigger>
          <TabsTrigger value="seller">Vendedor</TabsTrigger>
        </TabsList>
        
        <TabsContent value="description" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Descripción del producto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
              
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Especificaciones</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium">{key}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reviews" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Reseñas de clientes</h3>
            {session?.user && (
              <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
                <DialogTrigger asChild>
                  <Button>
                    <Star className="w-4 h-4 mr-2" />
                    Escribir reseña
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Escribir una reseña</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Calificación</label>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <button
                            key={i}
                            onClick={() => setReviewRating(i + 1)}
                            className="p-1"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                i < reviewRating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Comentario</label>
                      <Textarea
                        placeholder="Comparte tu experiencia con este producto..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSubmitReview} disabled={loading}>
                        Publicar reseña
                      </Button>
                      <Button variant="outline" onClick={() => setShowReviewModal(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={review.userImage} />
                        <AvatarFallback>{review.userName.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{review.userName}</span>
                          {review.verified && (
                            <Badge variant="secondary" className="text-xs">
                              <Award className="w-3 h-3 mr-1" />
                              Verificado
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {renderStars(review.rating, 'w-3 h-3')}
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{review.comment}</p>
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 mb-2">
                            {review.images.map((image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt={`Review image ${index + 1}`}
                                className="w-16 h-16 object-cover rounded"
                              />
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <button className="hover:text-gray-700">
                            👍 Útil ({review.helpful})
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h4 className="font-medium text-gray-900 mb-2">No hay reseñas aún</h4>
                <p className="text-gray-500 mb-4">Sé el primero en dejar una reseña de este producto</p>
                {session?.user && (
                  <Button onClick={() => setShowReviewModal(true)}>
                    Escribir la primera reseña
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="seller" className="space-y-6">
          {product.seller ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={product.seller.image} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-500 text-white text-xl font-semibold">
                      {product.seller.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{product.seller.name}</h3>
                      {product.seller.verified && (
                        <Shield className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">@{product.seller.username}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {product.seller.rating && (
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            {renderStars(product.seller.rating, 'w-3 h-3')}
                          </div>
                          <div className="text-sm text-gray-600">Calificación</div>
                        </div>
                      )}
                      {product.seller.totalSales && (
                        <div className="text-center">
                          <div className="text-lg font-semibold text-purple-600">
                            {formatNumber(product.seller.totalSales)}
                          </div>
                          <div className="text-sm text-gray-600">Ventas</div>
                        </div>
                      )}
                      {product.seller.joinedAt && (
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Clock className="w-4 h-4 text-gray-500" />
                          </div>
                          <div className="text-sm text-gray-600">
                            Desde {new Date(product.seller.joinedAt).getFullYear()}
                          </div>
                        </div>
                      )}
                      {product.seller.responseTime && (
                        <div className="text-center">
                          <div className="text-sm font-medium text-green-600">
                            {product.seller.responseTime}
                          </div>
                          <div className="text-sm text-gray-600">Respuesta</div>
                        </div>
                      )}
                    </div>
                    
                    {product.seller.location && (
                      <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{product.seller.location}</span>
                      </div>
                    )}
                    
                    {session?.user?.id !== product.seller.id && (
                      <div className="flex gap-3">
                        <Button
                          onClick={handleFollowSeller}
                          disabled={loading}
                          className={isSellerFollowed ? 'bg-blue-600 hover:bg-blue-700' : ''}
                        >
                          {isSellerFollowed ? (
                            <UserCheck className="w-4 h-4 mr-2" />
                          ) : (
                            <UserPlus className="w-4 h-4 mr-2" />
                          )}
                          {isSellerFollowed ? 'Siguiendo' : 'Seguir vendedor'}
                        </Button>
                        <Button variant="outline" onClick={() => setShowContactModal(true)}>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Enviar mensaje
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-gray-500">Información del vendedor no disponible</div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}