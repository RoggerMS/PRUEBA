'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  priceInSoles: number;
  quantity: number;
  stock: number;
  seller: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface ShoppingCartProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
}

export function ShoppingCart({
  items,
  isOpen,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: ShoppingCartProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalCrolars = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalSoles = items.reduce((sum, item) => sum + (item.priceInSoles * item.quantity), 0);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    if (newQuantity <= 0) {
      onRemoveItem(itemId);
      return;
    }

    if (newQuantity > item.stock) {
      toast.error(`Solo hay ${item.stock} unidades disponibles`);
      return;
    }

    onUpdateQuantity(itemId, newQuantity);
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('Tu carrito está vacío');
      return;
    }

    setIsProcessing(true);
    try {
      await onCheckout();
      toast.success('Procesando tu pedido...');
    } catch (error) {
      toast.error('Error al procesar el pedido');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number, currency: 'crolars' | 'soles') => {
    const symbol = currency === 'crolars' ? '₡' : 'S/';
    return `${symbol}${amount.toFixed(2)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-purple-600" />
            Carrito de Compras
            {totalItems > 0 && (
              <Badge variant="secondary">{totalItems} artículos</Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[60vh]">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tu carrito está vacío</h3>
              <p className="text-gray-500">Agrega algunos productos para comenzar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.productName}</h4>
                    <p className="text-xs text-gray-500">Por {item.seller.name}</p>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {formatCurrency(item.price, 'crolars')}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {formatCurrency(item.priceInSoles, 'soles')}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="w-8 h-8 p-0"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="w-8 h-8 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {items.length > 0 && (
          <div className="border-t p-4">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({totalItems} artículos):</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {formatCurrency(totalCrolars, 'crolars')}
                  </Badge>
                  <Badge variant="secondary">
                    {formatCurrency(totalSoles, 'soles')}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-600">
                    {formatCurrency(totalCrolars, 'crolars')}
                  </Badge>
                  <Badge variant="secondary">
                    {formatCurrency(totalSoles, 'soles')}
                  </Badge>
                </div>
              </div>
            </div>
            
            <Button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {isProcessing ? 'Procesando...' : 'Proceder al Pago'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

export default ShoppingCart;
