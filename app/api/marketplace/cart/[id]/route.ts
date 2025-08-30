import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validación para actualizar cantidad
const UpdateCartItemSchema = z.object({
  quantity: z.number().int().positive().max(10)
});

interface RouteParams {
  params: {
    id: string;
  };
}

// PUT /api/marketplace/cart/[id] - Actualizar cantidad de item en carrito
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { quantity } = UpdateCartItemSchema.parse(body);

    // Verificar que el item del carrito existe y pertenece al usuario
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.id },
      include: {
        product: true
      }
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Item del carrito no encontrado' },
        { status: 404 }
      );
    }

    if (cartItem.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permisos para actualizar este item' },
        { status: 403 }
      );
    }

    // Verificar stock disponible
    if (quantity > cartItem.product.stock) {
      return NextResponse.json(
        { error: 'Stock insuficiente' },
        { status: 400 }
      );
    }

    // Verificar que el producto sigue activo
    if (cartItem.product.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Producto no disponible' },
        { status: 400 }
      );
    }

    const updatedCartItem = await prisma.cartItem.update({
      where: { id: params.id },
      data: { quantity },
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

    return NextResponse.json(updatedCartItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating cart item:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/marketplace/cart/[id] - Eliminar item del carrito
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que el item del carrito existe y pertenece al usuario
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.id }
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Item del carrito no encontrado' },
        { status: 404 }
      );
    }

    if (cartItem.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar este item' },
        { status: 403 }
      );
    }

    await prisma.cartItem.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Item eliminado del carrito exitosamente' });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}