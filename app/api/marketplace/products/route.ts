import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validación para productos
const ProductSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  price: z.number().int().positive(),
  category: z.string().min(1),
  tags: z.string().optional(),
  images: z.string().optional(),
  stock: z.number().int().min(0).default(0),
  isOfficial: z.boolean().default(false)
});

const ProductUpdateSchema = ProductSchema.partial();

// GET /api/marketplace/products - Obtener productos del marketplace
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const featured = searchParams.get('featured') === 'true';

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {
      status: 'ACTIVE'
    };

    if (category && category !== 'featured') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (featured) {
      where.OR = [
        { isOfficial: true },
        { rating: { gte: 4.0 } },
        { sold: { gte: 10 } }
      ];
    }

    // Obtener productos
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
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
        },
        orderBy: {
          [sortBy]: sortOrder as 'asc' | 'desc'
        },
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/marketplace/products - Crear nuevo producto
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = ProductSchema.parse(body);

    // Solo administradores pueden crear productos oficiales
    if (validatedData.isOfficial && session.user.role !== 'ADMIN') {
      validatedData.isOfficial = false;
    }

    const product = await prisma.product.create({
      data: {
        ...validatedData,
        sellerId: session.user.id
      },
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

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}