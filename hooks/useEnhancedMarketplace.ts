import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useNotifications } from './useNotifications';
import useMessages from './useMessages';

interface EnhancedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  priceInSoles?: number;
  category: string;
  subcategory?: string;
  tags?: string;
  images?: string[];
  stock: number;
  sold: number;
  views: number;
  rating: number;
  ratingCount: number;
  favoriteCount: number;
  reviewCount: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SOLD_OUT';
  isOfficial: boolean;
  isFeatured: boolean;
  sellerId: string;
  seller: {
    id: string;
    name: string;
    username: string;
    image?: string;
    verified: boolean;
    rating?: number;
    totalSales?: number;
    memberSince?: string;
    isFollowing?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProductReview {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  user: {
    id: string;
    name: string;
    username: string;
    image?: string;
    verified: boolean;
  };
  helpful: number;
  notHelpful: number;
  createdAt: string;
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: EnhancedProduct;
  createdAt: string;
}

interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  summary: {
    totalItems: number;
    totalPrice: number;
    itemCount: number;
  };
}

interface Order {
  id: string;
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentMethod: string;
  shippingAddress?: any;
  buyer: {
    id: string;
    name: string;
    username: string;
    image?: string;
    verified: boolean;
  };
  items: {
    id: string;
    quantity: number;
    price: number;
    product: EnhancedProduct;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface MarketplaceStats {
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  topCategories: { category: string; count: number }[];
  recentActivity: {
    type: 'purchase' | 'review' | 'favorite';
    productId: string;
    productName: string;
    userId: string;
    userName: string;
    createdAt: string;
  }[];
}

export function useEnhancedMarketplace() {
  const [products, setProducts] = useState<EnhancedProduct[]>([]);
  const [cart, setCart] = useState<Cart>({ items: [], totalItems: 0, totalPrice: 0, summary: { totalItems: 0, totalPrice: 0, itemCount: 0 } });
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [reviews, setReviews] = useState<{ [productId: string]: ProductReview[] }>({});
  const [stats, setStats] = useState<MarketplaceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { data: session } = useSession();
  const { createNotification } = useNotifications();
  const { sendMessage } = useMessages();

  // Cargar productos con filtros avanzados
  const loadProducts = async (params?: {
    category?: string;
    subcategory?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    featured?: boolean;
    priceMin?: number;
    priceMax?: number;
    rating?: number;
    sellerId?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      if (params?.category) searchParams.set('category', params.category);
      if (params?.subcategory) searchParams.set('subcategory', params.subcategory);
      if (params?.search) searchParams.set('search', params.search);
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
      if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
      if (params?.featured) searchParams.set('featured', 'true');
      if (params?.priceMin) searchParams.set('priceMin', params.priceMin.toString());
      if (params?.priceMax) searchParams.set('priceMax', params.priceMax.toString());
      if (params?.rating) searchParams.set('rating', params.rating.toString());
      if (params?.sellerId) searchParams.set('sellerId', params.sellerId);

      const response = await fetch(`/api/marketplace/products?${searchParams}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar productos');
      }

      const data = await response.json();
      setProducts(data.products || []);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cargar carrito
  const loadCart = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/marketplace/cart');
      
      if (!response.ok) {
        throw new Error('Error al cargar carrito');
      }

      const data = await response.json();
      setCart(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar carrito';
      setError(errorMessage);
      return null;
    }
  };

  // Agregar al carrito
  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!session?.user?.id) {
      toast.error('Debes iniciar sesión para agregar productos al carrito');
      return false;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/marketplace/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al agregar al carrito');
      }

      await loadCart();
      toast.success('Producto agregado al carrito');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al agregar al carrito';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar cantidad en carrito
  const updateCartItem = async (itemId: string, quantity: number) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/marketplace/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar carrito');
      }

      await loadCart();
      toast.success('Carrito actualizado');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar carrito';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar del carrito
  const removeFromCart = async (itemId: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/marketplace/cart/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar del carrito');
      }

      await loadCart();
      toast.success('Producto eliminado del carrito');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar del carrito';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Limpiar carrito
  const clearCart = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/marketplace/cart', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al limpiar carrito');
      }

      await loadCart();
      toast.success('Carrito limpiado');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al limpiar carrito';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Agregar/quitar de favoritos
  const toggleFavorite = async (productId: string) => {
    if (!session?.user?.id) {
      toast.error('Debes iniciar sesión para agregar favoritos');
      return false;
    }

    try {
      const response = await fetch(`/api/marketplace/products/${productId}/favorite`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Error al actualizar favoritos');
      }

      const data = await response.json();
      
      if (data.isFavorite) {
        setFavorites(prev => [...prev, productId]);
        toast.success('Agregado a favoritos');
      } else {
        setFavorites(prev => prev.filter(id => id !== productId));
        toast.success('Eliminado de favoritos');
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar favoritos';
      toast.error(errorMessage);
      return false;
    }
  };

  // Seguir/dejar de seguir vendedor
  const toggleFollowSeller = async (sellerId: string) => {
    if (!session?.user?.id) {
      toast.error('Debes iniciar sesión para seguir vendedores');
      return false;
    }

    if (sellerId === session.user.id) {
      toast.error('No puedes seguirte a ti mismo');
      return false;
    }

    try {
      const response = await fetch(`/api/marketplace/sellers/${sellerId}/follow`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Error al actualizar seguimiento');
      }

      const data = await response.json();
      
      if (data.isFollowing) {
        setFollowing(prev => [...prev, sellerId]);
        toast.success('Ahora sigues a este vendedor');
        
        // Crear notificación para el vendedor
        await createNotification({
          userId: sellerId,
          type: 'FOLLOW',
          title: 'Nuevo seguidor',
          message: `${session.user.name} ahora te sigue`,
          metadata: {
            followerId: session.user.id,
            followerName: session.user.name
          }
        });
      } else {
        setFollowing(prev => prev.filter(id => id !== sellerId));
        toast.success('Dejaste de seguir a este vendedor');
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar seguimiento';
      toast.error(errorMessage);
      return false;
    }
  };

  // Contactar vendedor
  const contactSeller = async (sellerId: string, productId: string, message: string) => {
    if (!session?.user?.id) {
      toast.error('Debes iniciar sesión para contactar vendedores');
      return false;
    }

    try {
      const success = await sendMessage({
        receiverId: sellerId,
        content: message,
        type: 'PRODUCT_INQUIRY',
        metadata: {
          productId,
          inquiryType: 'product_question'
        }
      });

      if (success) {
        toast.success('Mensaje enviado al vendedor');
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar mensaje';
      toast.error(errorMessage);
      return false;
    }
  };

  // Crear reseña
  const createReview = async (productId: string, rating: number, comment: string) => {
    if (!session?.user?.id) {
      toast.error('Debes iniciar sesión para escribir reseñas');
      return false;
    }

    try {
      const response = await fetch(`/api/marketplace/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, comment }),
      });

      if (!response.ok) {
        throw new Error('Error al crear reseña');
      }

      const review = await response.json();
      
      // Actualizar reseñas localmente
      setReviews(prev => ({
        ...prev,
        [productId]: [...(prev[productId] || []), review]
      }));

      toast.success('Reseña publicada');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear reseña';
      toast.error(errorMessage);
      return false;
    }
  };

  // Cargar reseñas de un producto
  const loadProductReviews = async (productId: string) => {
    try {
      const response = await fetch(`/api/marketplace/products/${productId}/reviews`);
      
      if (!response.ok) {
        throw new Error('Error al cargar reseñas');
      }

      const data = await response.json();
      setReviews(prev => ({
        ...prev,
        [productId]: data.reviews
      }));
      
      return data.reviews;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar reseñas';
      setError(errorMessage);
      return [];
    }
  };

  // Crear orden
  const createOrder = async (orderData: {
    items: { productId: string; quantity: number; price: number }[];
    paymentMethod: string;
    shippingAddress?: any;
  }) => {
    if (!session?.user) {
      throw new Error('Debes iniciar sesión para crear una orden');
    }

    setLoading(true);
    try {
      const response = await fetch('/api/marketplace/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear la orden');
      }

      const order = await response.json();
      
      // Recargar el carrito después de crear la orden
      await loadCart();
      
      // Notificar a los vendedores
      const sellerIds = [...new Set(orderData.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        return product?.sellerId;
      }).filter(Boolean))];

      for (const sellerId of sellerIds) {
        await createNotification({
          userId: sellerId!,
          type: 'ORDER',
          title: 'Nueva orden recibida',
          message: `Tienes una nueva orden de ${session.user.name}`,
          metadata: {
            orderId: order.id,
            buyerId: session.user.id,
            buyerName: session.user.name
          }
        });
      }
      
      return order;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Cargar órdenes
  const loadOrders = async () => {
    if (!session?.user) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/marketplace/orders');
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al cargar las órdenes');
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error: any) {
      setError(error.message);
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas del marketplace
  const loadMarketplaceStats = async () => {
    try {
      const response = await fetch('/api/marketplace/stats');
      
      if (!response.ok) {
        throw new Error('Error al cargar estadísticas');
      }

      const data = await response.json();
      setStats(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar estadísticas';
      setError(errorMessage);
      return null;
    }
  };

  // Cargar favoritos del usuario
  const loadFavorites = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/marketplace/favorites');
      
      if (!response.ok) {
        throw new Error('Error al cargar favoritos');
      }

      const data = await response.json();
      setFavorites(data.favorites || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar favoritos';
      setError(errorMessage);
    }
  };

  // Cargar vendedores seguidos
  const loadFollowing = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/marketplace/following');
      
      if (!response.ok) {
        throw new Error('Error al cargar seguimientos');
      }

      const data = await response.json();
      setFollowing(data.following || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar seguimientos';
      setError(errorMessage);
    }
  };

  // Funciones de utilidad
  const isInCart = (productId: string) => {
    return cart.items?.some(item => item.product.id === productId) || false;
  };

  const getCartQuantity = (productId: string) => {
    const item = cart.items?.find(item => item.product.id === productId);
    return item?.quantity || 0;
  };

  const isFavorite = (productId: string) => {
    return favorites.includes(productId);
  };

  const isFollowingSeller = (sellerId: string) => {
    return following.includes(sellerId);
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (session?.user?.id) {
      loadCart();
      loadFavorites();
      loadFollowing();
    }
  }, [session?.user?.id]);

  return {
    // Estado
    products,
    cart,
    orders,
    favorites,
    following,
    reviews,
    stats,
    loading,
    error,
    
    // Funciones de productos
    loadProducts,
    loadProductReviews,
    
    // Funciones de carrito
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    loadCart,
    
    // Funciones de favoritos y seguimiento
    toggleFavorite,
    toggleFollowSeller,
    loadFavorites,
    loadFollowing,
    
    // Funciones de interacción
    contactSeller,
    createReview,
    
    // Funciones de órdenes
    createOrder,
    loadOrders,
    
    // Funciones de estadísticas
    loadMarketplaceStats,
    
    // Funciones de utilidad
    isInCart,
    getCartQuantity,
    isFavorite,
    isFollowingSeller,
  };
}