'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useMarketplace } from '@/hooks/useMarketplace';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Loader2,
  ArrowLeft,
  Package,
  Star
} from 'lucide-react';

interface CrolarsCartProps {
  onBack?: () => void;
}

export default function CrolarsCart({ onBack }: CrolarsCartProps) {
  const { toast } = useToast();
  const {
    cart,
    loading,
    updateCartItem,
    removeFromCart,
    clearCart,
    createOrder
  } = useMarketplace();
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await handleRemoveItem(itemId);
      return;
    }
    
    try {
      await updateCartItem(itemId, newQuantity);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la cantidad del producto",
        variant: "destructive"
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado del carrito"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto del carrito",
        variant: "destructive"
      });
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast({
        title: "Carrito vaciado",
        description: "Todos los productos han sido eliminados del carrito"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo vaciar el carrito",
        variant: "destructive"
      });
    }
  };

  const handleCheckout = async () => {
    if (!cart.items || cart.items.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega productos al carrito antes de proceder al checkout",
        variant: "destructive"
      });
      return;
    }

    setIsCheckingOut(true);
    try {
      const orderData = {
        items: cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price
        }))
      };
      
      await createOrder(orderData);
      
      toast({
        title: "¡Compra exitosa!",
        description: "Tu orden ha sido procesada correctamente"
      });
      
      // Regresar al marketplace después del checkout exitoso
      if (onBack) {
        onBack();
      }
    } catch (error: any) {
      toast({
        title: "Error en el checkout",
        description: error.message || "No se pudo procesar la compra",
        variant: "destructive"
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'epic': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      case 'common': return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  if (loading && !cart.items) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-600">Cargando carrito...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <ShoppingCart className="w-6 h-6 mr-2 text-purple-600" />
              Mi Carrito
            </h1>
            <p className="text-gray-600">
              {cart.totalItems || 0} {(cart.totalItems || 0) === 1 ? 'producto' : 'productos'} en tu carrito
            </p>
          </div>
        </div>
        
        {cart.items && cart.items.length > 0 && (
          <Button 
            variant="outline" 
            onClick={handleClearCart}
            disabled={loading}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Vaciar carrito
          </Button>
        )}
      </div>

      {!cart.items || cart.items.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-6 bg-gray-100 rounded-full">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Tu carrito está vacío
                </h3>
                <p className="text-gray-600 mb-6">
                  Explora nuestro marketplace y encuentra productos increíbles
                </p>
                {onBack && (
                  <Button onClick={onBack} className="bg-purple-600 hover:bg-purple-700">
                    <Package className="w-4 h-4 mr-2" />
                    Explorar productos
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex space-x-4">
                    <div className="relative flex-shrink-0">
                      <img 
                        src={item.product.image} 
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <Badge className={`absolute -top-1 -right-1 text-xs ${getRarityColor(item.product.rarity)}`}>
                        <Star className="w-3 h-3" />
                      </Badge>
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800">{item.product.name}</h3>
                          <p className="text-sm text-gray-600 line-clamp-1">{item.product.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs capitalize">
                              {item.product.category}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              por {item.product.seller?.name || 'Vendedor'}
                            </span>
                          </div>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={loading}
                          className="text-red-600 hover:bg-red-50 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center border rounded-lg">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={loading || item.quantity <= 1}
                              className="p-1 h-8 w-8"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={loading || item.quantity >= item.product.stock}
                              className="p-1 h-8 w-8"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <span className="text-xs text-gray-500">
                            Stock: {item.product.stock}
                          </span>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-purple-600">
                            {item.product.price * item.quantity} Crolars
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.product.price} c/u
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="space-y-4">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Resumen del pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Productos ({cart.totalItems})</span>
                    <span>{cart.totalPrice} Crolars</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Envío</span>
                    <span className="text-green-600">Gratis</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-purple-600">{cart.totalPrice} Crolars</span>
                </div>
                
                <Button 
                  onClick={handleCheckout}
                  disabled={isCheckingOut || loading}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Proceder al pago
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  El pago se realizará con tus Crolars disponibles
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}