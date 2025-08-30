import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validación para crear orden
const CreateOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive().max(10)
  })).min(1),
  paymentMethod: z.enum(['CROLARS']),
  shippingAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().min(1)
  }).optional()
});

// GET /api/marketplace/orders - Obtener órdenes del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const role = searchParams.get('role'); // 'buyer' o 'seller'

    const skip = (page - 1) * limit;

    let whereClause: any = {};

    if (role === 'seller') {
      // Órdenes donde el usuario es vendedor
      whereClause = {
        items: {
          some: {
            product: {
              sellerId: session.user.id
            }
          }
        }
      };
    } else {
      // Órdenes donde el usuario es comprador (default)
      whereClause = {
        buyerId: session.user.id
      };
    }

    if (status) {
      whereClause.status = status;
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
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
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.order.count({ where: whereClause })
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/marketplace/orders - Crear nueva orden (checkout)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { items, paymentMethod, shippingAddress } = CreateOrderSchema.parse(body);

    // Verificar que el usuario tiene suficientes Crolars
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { crolars: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Validar productos y calcular total
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return NextResponse.json(
          { error: `Producto ${item.productId} no encontrado` },
          { status: 404 }
        );
      }

      if (product.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: `Producto ${product.name} no está disponible` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para ${product.name}` },
          { status: 400 }
        );
      }

      if (product.sellerId === session.user.id) {
        return NextResponse.json(
          { error: 'No puedes comprar tu propio producto' },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        product
      });
    }

    // Verificar fondos suficientes
    if (user.crolars < totalAmount) {
      return NextResponse.json(
        { error: 'Crolars insuficientes para completar la compra' },
        { status: 400 }
      );
    }

    // Crear la orden en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear la orden
      const order = await tx.order.create({
        data: {
          buyerId: session.user.id,
          totalAmount,
          status: 'PENDING',
          paymentMethod,
          shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : null,
          items: {
            create: validatedItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        },
        include: {
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

      // Descontar Crolars del comprador
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          crolars: {
            decrement: totalAmount
          }
        }
      });

      // Actualizar stock de productos
      for (const item of validatedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      // Limpiar carrito del usuario
      await tx.cartItem.deleteMany({
        where: {
          userId: session.user.id,
          productId: {
            in: validatedItems.map(item => item.productId)
          }
        }
      });

      // Crear notificaciones para los vendedores
      const sellerIds = [...new Set(validatedItems.map(item => item.product.sellerId))];
      
      for (const sellerId of sellerIds) {
        await tx.notification.create({
          data: {
            userId: sellerId,
            type: 'MARKETPLACE_SALE',
            title: 'Nueva venta en el marketplace',
            message: `Has recibido una nueva orden de compra`,
            metadata: JSON.stringify({ orderId: order.id })
          }
        });
      }

      return order;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}