import express, { type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { z } from 'zod';
import { crolarsToSoles } from '../../shared/constants/currency';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/products');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = file.originalname.split('.').pop();
    cb(null, `product-${uniqueSuffix}.${extension}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Validation schemas
const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  price: z.number().positive(),
  priceInSoles: z.number().positive().optional(),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  tags: z.string().optional(),
  stock: z.number().int().min(0).default(1),
  isFeatured: z.boolean().default(false)
});

const updateProductSchema = createProductSchema.partial();

// GET /api/marketplace/products - Get all products with filters
router.get('/products', async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '12',
      category,
      subcategory,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      featured
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
      status: 'ACTIVE'
    };

    if (category) {
      where.category = category;
    }

    if (subcategory) {
      where.subcategory = subcategory;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { tags: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (minPrice || maxPrice) {
      where.priceInSoles = {};
      if (minPrice) where.priceInSoles.gte = parseFloat(minPrice as string);
      if (maxPrice) where.priceInSoles.lte = parseFloat(maxPrice as string);
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    // Build orderBy
    const orderBy: any = {};
    if (sortBy === 'price') {
      orderBy.priceInSoles = sortOrder;
    } else if (sortBy === 'rating') {
      orderBy.rating = sortOrder;
    } else if (sortBy === 'views') {
      orderBy.views = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              username: true
            }
          },
          _count: {
            select: {
              productReviews: true,
              productFavorites: true
            }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    // Parse images JSON for each product
    const productsWithImages = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      favoriteCount: product._count.productFavorites,
      reviewCount: product._count.productReviews
    }));

    res.json({
      success: true,
      data: {
        products: productsWithImages,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching products'
    });
  }
});

// GET /api/marketplace/products/:id - Get single product
router.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            username: true,
            createdAt: true
          }
        },
        productReviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            productFavorites: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Increment views
    await prisma.product.update({
      where: { id },
      data: { views: { increment: 1 } }
    });

    const productWithImages = {
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      favoriteCount: product._count.productFavorites
    };

    res.json({
      success: true,
      data: productWithImages
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching product'
    });
  }
});

// POST /api/marketplace/products - Create new product
router.post('/products', upload.array('images', 5), async (req: Request, res: Response) => {
  try {
    const validatedData = createProductSchema.parse({
      ...req.body,
      price: parseFloat(req.body.price),
      priceInSoles: req.body.priceInSoles ? parseFloat(req.body.priceInSoles) : undefined,
      stock: parseInt(req.body.stock || '1'),
      isFeatured: req.body.isFeatured === 'true'
    });

    // Store image file paths
    const images: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        // Store relative path from public directory
        const imagePath = `/uploads/products/${file.filename}`;
        images.push(imagePath);
      }
    }

    // Calculate price in soles if not provided
    const priceInSoles = validatedData.priceInSoles || crolarsToSoles(validatedData.price);

    const product = await prisma.product.create({
      data: {
        ...validatedData,
        priceInSoles,
        images: JSON.stringify(images),
        // For now, we'll set sellerId to null since we don't have auth
        // In production, you'd get this from the authenticated user
        sellerId: null
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            username: true
          }
        }
      }
    });

    // Record initial price in history
    await prisma.priceHistory.create({
      data: {
        price: validatedData.price,
        priceInSoles,
        productId: product.id
      }
    });

    const productWithImages = {
      ...product,
      images: images
    };

    res.status(201).json({
      success: true,
      data: productWithImages
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }

    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating product'
    });
  }
});

// PUT /api/marketplace/products/:id - Update product
router.put('/products/:id', upload.array('images', 5), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateProductSchema.parse({
      ...req.body,
      price: req.body.price ? parseFloat(req.body.price) : undefined,
      priceInSoles: req.body.priceInSoles ? parseFloat(req.body.priceInSoles) : undefined,
      stock: req.body.stock ? parseInt(req.body.stock) : undefined,
      isFeatured: req.body.isFeatured ? req.body.isFeatured === 'true' : undefined
    });

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Handle new images
    let images: string[] = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      for (const file of req.files) {
        // Store relative path from public directory
        const imagePath = `/uploads/products/${file.filename}`;
        images.push(imagePath);
      }
    } else {
      // Keep existing images if no new ones uploaded
      images = existingProduct.images ? JSON.parse(existingProduct.images) : [];
    }

    // Calculate price in soles if price changed
    let priceInSoles = validatedData.priceInSoles;
    if (validatedData.price && !priceInSoles) {
      priceInSoles = crolarsToSoles(validatedData.price);
    }

    const updateData: any = {
      ...validatedData,
      images: JSON.stringify(images)
    };

    if (priceInSoles) {
      updateData.priceInSoles = priceInSoles;
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            username: true
          }
        }
      }
    });

    // Record price change in history if price changed
    if (validatedData.price && validatedData.price !== existingProduct.price) {
      await prisma.priceHistory.create({
        data: {
          price: validatedData.price,
          priceInSoles: priceInSoles || crolarsToSoles(validatedData.price),
          productId: product.id
        }
      });
    }

    const productWithImages = {
      ...product,
      images: images
    };

    res.json({
      success: true,
      data: productWithImages
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }

    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating product'
    });
  }
});

// DELETE /api/marketplace/products/:id - Delete product
router.delete('/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Soft delete by updating status
    await prisma.product.update({
      where: { id },
      data: { status: 'INACTIVE' }
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting product'
    });
  }
});

// GET /api/marketplace/categories - Get all categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.marketplaceCategory.findMany({
      where: {
        parentId: null // Only root categories
      },
      include: {
        children: {
          orderBy: {
            name: 'asc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching categories'
    });
  }
});

// POST /api/marketplace/products/:id/favorite - Toggle favorite
router.post('/products/:id/favorite', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body; // In production, get from auth

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Check if already favorited
    const existingFavorite = await prisma.productFavorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: id
        }
      }
    });

    if (existingFavorite) {
      // Remove favorite
      await prisma.productFavorite.delete({
        where: {
          id: existingFavorite.id
        }
      });

      res.json({
        success: true,
        data: { favorited: false }
      });
    } else {
      // Add favorite
      await prisma.productFavorite.create({
        data: {
          userId,
          productId: id
        }
      });

      res.json({
        success: true,
        data: { favorited: true }
      });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({
      success: false,
      error: 'Error toggling favorite'
    });
  }
});

// POST /api/marketplace/products/:id/review - Add review
router.post('/products/:id/review', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment, userId } = req.body; // In production, get userId from auth

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.productReview.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: id
        }
      }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this product'
      });
    }

    // Create review
    const review = await prisma.productReview.create({
      data: {
        rating: parseInt(rating),
        comment,
        userId,
        productId: id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true
          }
        }
      }
    });

    // Update product rating
    const reviews = await prisma.productReview.findMany({
      where: { productId: id }
    });

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.product.update({
      where: { id },
      data: {
        rating: avgRating,
        ratingCount: reviews.length
      }
    });

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating review'
    });
  }
});

export default router;