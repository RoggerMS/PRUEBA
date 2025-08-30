import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validación para agregar items al carrito
const AddToCartSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(10)
});

// Schema de validación para actualizar cantidad
const UpdateCartItemSchema = z.object({
  quantity: z.number().int().positive().max(10)
});

// GET /api/marketplace/cart - Obtener carrito del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
                verified: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calcular totales
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce(
      (sum, item) => sum + (item.product.price * item.quantity),
      0
    );

    return NextResponse.json({
      items: cartItems,
      summary: {
        totalItems,
        totalPrice,
        itemCount: cartItems.length
      }
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/marketplace/cart - Agregar producto al carrito
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, quantity } = AddToCartSchema.parse(body);

    // Verificar que el producto existe y está disponible
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    if (product.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Producto no disponible' },
        { status: 400 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: 'Stock insuficiente' },
        { status: 400 }
      );
    }

    // No permitir que el vendedor compre su propio producto
    if (product.sellerId === session.user.id) {
      return NextResponse.json(
        { error: 'No puedes comprar tu propio producto' },
        { status: 400 }
      );
    }

    // Verificar si el item ya existe en el carrito
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId
        }
      }
    });

    let cartItem;

    if (existingCartItem) {
      // Actualizar cantidad si ya existe
      const newQuantity = existingCartItem.quantity + quantity;
      
      if (newQuantity > product.stock) {
        return NextResponse.json(
          { error: 'Stock insuficiente para la cantidad solicitada' },
          { status: 400 }
        );
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            include: {
              seller: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  image: true,
                  verified: true
                }
              }
            }
          }
        }
      });
    } else {
      // Crear nuevo item en el carrito
      cartItem = await prisma.cartItem.create({
        data: {
          userId: session.user.id,
          productId: productId,
          quantity: quantity
        },
        include: {
          product: {
            include: {
              seller: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  image: true,
                  verified: true
                }
              }
            }
          }
        }
      });
    }

    return NextResponse.json(cartItem, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/marketplace/cart - Limpiar carrito completo
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id }
    });

    return NextResponse.json({ message: 'Carrito limpiado exitosamente' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}