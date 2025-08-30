import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validación para actualizar estado de orden
const UpdateOrderSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  trackingNumber: z.string().optional(),
  notes: z.string().max(500).optional()
});

// GET /api/marketplace/orders/[id] - Obtener orden específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            verified: true,
            university: true,
            career: true
          }
        },
        items: {
          include: {
            product: {
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
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    // Verificar permisos (comprador o vendedor de algún producto)
    const isbuyer = order.buyerId === session.user.id;
    const isSeller = order.items.some(
      item => item.product.sellerId === session.user.id
    );
    const isAdmin = session.user.role === 'ADMIN';

    if (!isbuyer && !isSeller && !isAdmin) {
      return NextResponse.json(
        { error: 'No tienes permisos para ver esta orden' },
        { status: 403 }
      );
    }

    // Parsear dirección de envío si existe
    const parsedOrder = {
      ...order,
      shippingAddress: order.shippingAddress 
        ? JSON.parse(order.shippingAddress) 
        : null
    };

    return NextResponse.json(parsedOrder);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/marketplace/orders/[id] - Actualizar estado de orden
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
    const { status, trackingNumber, notes } = UpdateOrderSchema.parse(body);

    // Verificar que la orden existe
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    // Verificar permisos
    const isAdmin = session.user.role === 'ADMIN';
    const isSeller = existingOrder.items.some(
      item => item.product.sellerId === session.user.id
    );
    const isBuyer = existingOrder.buyerId === session.user.id;

    // Solo vendedores, admins o compradores (para cancelar) pueden actualizar
    if (!isAdmin && !isSeller && !(isBuyer && status === 'CANCELLED')) {
      return NextResponse.json(
        { error: 'No tienes permisos para actualizar esta orden' },
        { status: 403 }
      );
    }

    // Validar transiciones de estado
    const validTransitions: Record<string, string[]> = {
      'PENDING': ['PROCESSING', 'CANCELLED'],
      'PROCESSING': ['SHIPPED', 'CANCELLED'],
      'SHIPPED': ['DELIVERED'],
      'DELIVERED': [], // Estado final
      'CANCELLED': [] // Estado final
    };

    if (!validTransitions[existingOrder.status].includes(status)) {
      return NextResponse.json(
        { error: `No se puede cambiar de ${existingOrder.status} a ${status}` },
        { status: 400 }
      );
    }

    // Si se cancela la orden, restaurar stock y Crolars
    const updateData: any = {
      status,
      trackingNumber,
      notes
    };

    if (status === 'CANCELLED' && existingOrder.status !== 'CANCELLED') {
      await prisma.$transaction(async (tx) => {
        // Actualizar la orden
        await tx.order.update({
          where: { id },
          data: updateData
        });

        // Restaurar stock de productos
        for (const item of existingOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity
              }
            }
          });
        }

        // Devolver Crolars al comprador
        await tx.user.update({
          where: { id: existingOrder.buyerId },
          data: {
            crolars: {
              increment: existingOrder.totalAmount
            }
          }
        });

        // Crear notificación para el comprador
        await tx.notification.create({
          data: {
            userId: existingOrder.buyerId,
            type: 'MARKETPLACE_ORDER_CANCELLED',
            title: 'Orden cancelada',
            message: `Tu orden ha sido cancelada. Los Crolars han sido devueltos a tu cuenta.`,
            metadata: JSON.stringify({ orderId: id })
          }
        });
      });
    } else if (status === 'DELIVERED' && existingOrder.status !== 'DELIVERED') {
      // Cuando se entrega, transferir Crolars a los vendedores
      await prisma.$transaction(async (tx) => {
        // Actualizar la orden
        await tx.order.update({
          where: { id },
          data: updateData
        });

        // Agrupar items por vendedor y transferir Crolars
        const sellerTotals = new Map<string, number>();
        
        for (const item of existingOrder.items) {
          const sellerId = item.product.sellerId;
          const itemTotal = item.price * item.quantity;
          
          sellerTotals.set(
            sellerId, 
            (sellerTotals.get(sellerId) || 0) + itemTotal
          );
        }

        // Transferir Crolars a cada vendedor
        for (const [sellerId, amount] of sellerTotals) {
          await tx.user.update({
            where: { id: sellerId },
            data: {
              crolars: {
                increment: amount
              }
            }
          });

          // Crear notificación para el vendedor
          await tx.notification.create({
            data: {
              userId: sellerId,
              type: 'MARKETPLACE_PAYMENT_RECEIVED',
              title: 'Pago recibido',
              message: `Has recibido ${amount} Crolars por una venta completada.`,
              metadata: JSON.stringify({ orderId: id, amount })
            }
          });
        }

        // Crear notificación para el comprador
        await tx.notification.create({
          data: {
            userId: existingOrder.buyerId,
            type: 'MARKETPLACE_ORDER_DELIVERED',
            title: 'Orden entregada',
            message: 'Tu orden ha sido marcada como entregada.',
            metadata: JSON.stringify({ orderId: id })
          }
        });
      });
    } else {
      // Actualización normal de estado
      await prisma.order.update({
        where: { id },
        data: updateData
      });

      // Crear notificación para el comprador sobre cambio de estado
      await prisma.notification.create({
        data: {
          userId: existingOrder.buyerId,
          type: 'MARKETPLACE_ORDER_UPDATE',
          title: 'Actualización de orden',
          message: `Tu orden ha sido actualizada a: ${status}`,
          metadata: JSON.stringify({ orderId: id, status })
        }
      });
    }

    // Obtener la orden actualizada
    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            verified: true
          }
        },
        items: {
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
        }
      }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}