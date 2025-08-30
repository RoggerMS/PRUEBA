import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tags?: string;
  images?: string;
  stock: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SOLD_OUT';
  isOfficial: boolean;
  sellerId: string;
  seller: {
    id: string;
    name: string;
    username: string;
    image?: string;
    verified: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
  createdAt: string;
}

interface CartSummary {
  totalItems: number;
  totalPrice: number;
  itemCount: number;
}

interface Cart {
  items?: CartItem[];
  totalItems?: number;
  totalPrice?: number;
  summary?: CartSummary;
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
    product: Product;
  }[];
  createdAt: string;
  updatedAt: string;
}

export function useMarketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Cart>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  // Cargar productos
  const loadProducts = async (params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    featured?: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      if (params?.category) searchParams.set('category', params.category);
      if (params?.search) searchParams.set('search', params.search);
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
      if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
      if (params?.featured) searchParams.set('featured', 'true');

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

      await loadCart(); // Recargar carrito
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

      await loadCart(); // Recargar carrito
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

      await loadCart(); // Recargar carrito
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

      await loadCart(); // Recargar carrito
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

  const createOrder = async (orderData: {
    items: { productId: string; quantity: number; price: number }[];
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
      
      return order;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

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

  // Verificar si un producto está en el carrito
  const isInCart = (productId: string) => {
    return cart.items.some(item => item.product.id === productId);
  };

  // Obtener cantidad de un producto en el carrito
  const getCartQuantity = (productId: string) => {
    const item = cart.items.find(item => item.product.id === productId);
    return item?.quantity || 0;
  };

  // Cargar carrito al montar el componente
  useEffect(() => {
    if (session?.user?.id) {
      loadCart();
    }
  }, [session?.user?.id]);

  return {
    products,
    cart,
    orders,
    loading,
    error,
    loadProducts,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    loadCart,
    createOrder,
    loadOrders,
  };
}