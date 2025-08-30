import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validación para actualización de productos
const ProductUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  price: z.number().int().positive().optional(),
  category: z.string().min(1).optional(),
  tags: z.string().optional(),
  images: z.string().optional(),
  stock: z.number().int().min(0).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SOLD_OUT']).optional()
});

// GET /api/marketplace/products/[id] - Obtener producto específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            verified: true,
            university: true,
            career: true
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/marketplace/products/[id] - Actualizar producto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = ProductUpdateSchema.parse(body);

    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos (solo el vendedor o admin puede actualizar)
    if (
      existingProduct.sellerId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'No tienes permisos para actualizar este producto' },
        { status: 403 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: validatedData,
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
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/marketplace/products/[id] - Eliminar producto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos (solo el vendedor o admin puede eliminar)
    if (
      existingProduct.sellerId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar este producto' },
        { status: 403 }
      );
    }

    // Verificar si hay órdenes pendientes con este producto
    const pendingOrders = await prisma.orderItem.findFirst({
      where: {
        productId: id,
        order: {
          status: {
            in: ['PENDING', 'PROCESSING']
          }
        }
      }
    });

    if (pendingOrders) {
      return NextResponse.json(
        { error: 'No se puede eliminar el producto porque tiene órdenes pendientes' },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}