/**
 * Workspace API routes for Express server
 * Implements workspace functionality with proper field mapping
 */
import { Router, type Request, type Response } from 'express';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth.js';
import { prisma } from '../../lib/prisma.js';
import { z } from 'zod';
import { WorkspaceBlockType } from '@prisma/client';

const router = Router();

// Schema for board creation
const createBoardSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo'),
});

// Schema for board update
const updateBoardSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo').optional(),
  isDefault: z.boolean().optional(),
});

// Schema for block creation
const createBlockSchema = z.object({
  type: z.nativeEnum(WorkspaceBlockType),
  title: z.string().min(1, 'El título es requerido').max(100, 'El título es muy largo'),
  boardId: z.string().cuid('ID de pizarra inválido'),
  x: z.number().int().min(0).default(0),
  y: z.number().int().min(0).default(0),
  w: z.number().int().min(200).max(800).default(300),
  h: z.number().int().min(150).max(600).default(200),
});

// Helper function to map database fields to frontend expected fields
function mapBlockFields(block: any) {
  return {
    ...block,
    width: block.w,
    height: block.h,
    completed: block.locked,
    // Remove original fields
    w: undefined,
    h: undefined,
    locked: undefined,
  };
}

// Helper function to get session from request
async function getSessionFromRequest(req: Request): Promise<any> {
  // For Express, we need to simulate the NextAuth session
  // This is a simplified version - in production you'd want proper session handling
  
  // Create or get demo user
  const demoUserId = 'demo-user-id';
  
  try {
    // Try to find existing user
    let user = await prisma.user.findUnique({
      where: { id: demoUserId }
    });
    
    // If user doesn't exist, create it
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: demoUserId,
          email: 'demo@example.com',
          username: 'demo-user',
          name: 'Demo User'
        }
      });
    }
    
    return { user: { id: user.id } };
  } catch (error) {
    console.error('Error managing demo user:', error);
    return null;
  }
}

/**
 * Get all boards for the authenticated user
 * GET /api/workspace/boards
 */
router.get('/boards', async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await getSessionFromRequest(req);
    
    if (!session?.user?.id) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    const boards = await prisma.workspaceBoard.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        blocks: {
          select: {
            id: true,
            type: true,
            title: true,
            x: true,
            y: true,
            w: true,
            h: true,
            zIndex: true,
            locked: true,
          },
        },
        _count: {
          select: {
            blocks: true,
          },
        },
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    // Map database fields to frontend expected fields
    const mappedBoards = boards.map(board => ({
      ...board,
      blocks: board.blocks.map(mapBlockFields),
    }));

    res.json({ boards: mappedBoards });
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Create a new board
 * POST /api/workspace/boards
 */
router.post('/boards', async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await getSessionFromRequest(req);
    
    if (!session?.user?.id) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    const validatedData = createBoardSchema.parse(req.body);

    // Check if user already has 10 boards (limit)
    const boardCount = await prisma.workspaceBoard.count({
      where: {
        userId: session.user.id,
      },
    });

    if (boardCount >= 10) {
      res.status(400).json({ error: 'Límite de pizarras alcanzado (máximo 10)' });
      return;
    }

    // If this is the first board, make it default
    const isFirstBoard = boardCount === 0;

    const board = await prisma.workspaceBoard.create({
      data: {
        name: validatedData.name,
        isDefault: isFirstBoard,
        userId: session.user.id,
      },
      include: {
        blocks: {
          select: {
            id: true,
            type: true,
            title: true,
            x: true,
            y: true,
            w: true,
            h: true,
            zIndex: true,
            locked: true,
          },
        },
        _count: {
          select: {
            blocks: true,
          },
        },
      },
    });

    // Map database fields to frontend expected fields
    const mappedBoard = {
      ...board,
      blocks: board.blocks.map(mapBlockFields),
    };

    res.status(201).json({ board: mappedBoard });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Datos inválidos', details: error.issues });
      return;
    }

    console.error('Error creating board:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Get a specific board
 * GET /api/workspace/boards/:id
 */
router.get('/boards/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await getSessionFromRequest(req);
    
    if (!session?.user?.id) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    const board = await prisma.workspaceBoard.findFirst({
      where: {
        id: req.params.id,
        userId: session.user.id,
      },
      include: {
        blocks: {
          select: {
            id: true,
            type: true,
            title: true,
            x: true,
            y: true,
            w: true,
            h: true,
            zIndex: true,
            locked: true,
          },
        },
        _count: {
          select: {
            blocks: true,
          },
        },
      },
    });

    if (!board) {
      res.status(404).json({ error: 'Pizarra no encontrada' });
      return;
    }

    // Map database fields to frontend expected fields
    const mappedBoard = {
      ...board,
      blocks: board.blocks.map(mapBlockFields),
    };

    res.json({ board: mappedBoard });
  } catch (error) {
    console.error('Error fetching board:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Update a board
 * PATCH /api/workspace/boards/:id
 */
router.patch('/boards/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await getSessionFromRequest(req);
    
    if (!session?.user?.id) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    const validatedData = updateBoardSchema.parse(req.body);

    // Verify board belongs to user
    const existingBoard = await prisma.workspaceBoard.findFirst({
      where: {
        id: req.params.id,
        userId: session.user.id,
      },
    });

    if (!existingBoard) {
      res.status(404).json({ error: 'Pizarra no encontrada' });
      return;
    }

    const board = await prisma.workspaceBoard.update({
      where: {
        id: req.params.id,
      },
      data: validatedData,
      include: {
        blocks: {
          select: {
            id: true,
            type: true,
            title: true,
            x: true,
            y: true,
            w: true,
            h: true,
            zIndex: true,
            locked: true,
          },
        },
        _count: {
          select: {
            blocks: true,
          },
        },
      },
    });

    // Map database fields to frontend expected fields
    const mappedBoard = {
      ...board,
      blocks: board.blocks.map(mapBlockFields),
    };

    res.json({ board: mappedBoard });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Datos inválidos', details: error.issues });
      return;
    }

    console.error('Error updating board:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Delete a board
 * DELETE /api/workspace/boards/:id
 */
router.delete('/boards/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await getSessionFromRequest(req);
    
    if (!session?.user?.id) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    // Verify board belongs to user
    const board = await prisma.workspaceBoard.findFirst({
      where: {
        id: req.params.id,
        userId: session.user.id,
      },
    });

    if (!board) {
      res.status(404).json({ error: 'Pizarra no encontrada' });
      return;
    }

    // Check if it's the default board
    if (board.isDefault) {
      res.status(400).json({ error: 'No se puede eliminar la pizarra por defecto' });
      return;
    }

    await prisma.workspaceBoard.delete({
      where: {
        id: req.params.id,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting board:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Get blocks for a specific board
 * GET /api/workspace/blocks
 */
router.get('/blocks', async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await getSessionFromRequest(req);
    
    if (!session?.user?.id) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    const boardId = req.query.boardId as string;

    if (!boardId) {
      res.status(400).json({ error: 'ID de pizarra requerido' });
      return;
    }

    // Verify board belongs to user
    const board = await prisma.workspaceBoard.findFirst({
      where: {
        id: boardId,
        userId: session.user.id,
      },
    });

    if (!board) {
      res.status(404).json({ error: 'Pizarra no encontrada' });
      return;
    }

    const blocks = await prisma.workspaceBlock.findMany({
      where: {
        boardId: boardId,
      },
      include: {
        docsPages: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
        kanbanColumns: {
          include: {
            cards: {
              orderBy: {
                orderIndex: 'asc',
              },
            },
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
        frasesItems: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        zIndex: 'asc',
      },
    });

    // Map database fields to frontend expected fields
    const mappedBlocks = blocks.map(mapBlockFields);

    res.json({ blocks: mappedBlocks });
  } catch (error) {
    console.error('Error fetching blocks:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Create a new block
 * POST /api/workspace/blocks
 */
router.post('/blocks', async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await getSessionFromRequest(req);
    
    if (!session?.user?.id) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    const validatedData = createBlockSchema.parse(req.body);

    // Verify board belongs to user
    const board = await prisma.workspaceBoard.findFirst({
      where: {
        id: validatedData.boardId,
        userId: session.user.id,
      },
    });

    if (!board) {
      res.status(404).json({ error: 'Pizarra no encontrada' });
      return;
    }

    // Check block limit (100 per board)
    const blockCount = await prisma.workspaceBlock.count({
      where: {
        boardId: validatedData.boardId,
      },
    });

    if (blockCount >= 100) {
      res.status(400).json({ error: 'Límite de bloques alcanzado (máximo 100 por pizarra)' });
      return;
    }

    // Get next zIndex
    const maxZIndex = await prisma.workspaceBlock.findFirst({
      where: {
        boardId: validatedData.boardId,
      },
      orderBy: {
        zIndex: 'desc',
      },
      select: {
        zIndex: true,
      },
    });

    const nextZIndex = (maxZIndex?.zIndex || 0) + 1;

    // Create block with initial content based on type
    const block = await prisma.workspaceBlock.create({
      data: {
        type: validatedData.type,
        title: validatedData.title,
        x: validatedData.x,
        y: validatedData.y,
        w: validatedData.w,
        h: validatedData.h,
        zIndex: nextZIndex,
        boardId: validatedData.boardId,
      },
    });

    // Create initial content based on block type
    if (validatedData.type === 'DOCS') {
      await prisma.docsPage.create({
        data: {
          title: 'Página 1',
          content: '',
          orderIndex: 0,
          blockId: block.id,
        },
      });
    } else if (validatedData.type === 'KANBAN') {
      // Create default columns
      const defaultColumns = [
        { title: 'Por hacer', orderIndex: 0 },
        { title: 'En progreso', orderIndex: 1 },
        { title: 'Completado', orderIndex: 2 },
      ];

      for (const column of defaultColumns) {
        await prisma.kanbanColumn.create({
          data: {
            title: column.title,
            orderIndex: column.orderIndex,
            blockId: block.id,
          },
        });
      }
    }
    // FRASES type doesn't need initial content

    // Fetch the created block with its content
    const createdBlock = await prisma.workspaceBlock.findUnique({
      where: {
        id: block.id,
      },
      include: {
        docsPages: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
        kanbanColumns: {
          include: {
            cards: {
              orderBy: {
                orderIndex: 'asc',
              },
            },
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
        frasesItems: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    // Map database fields to frontend expected fields
    const mappedBlock = mapBlockFields(createdBlock!);

    res.status(201).json({ block: mappedBlock });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Datos inválidos', details: error.issues });
      return;
    }

    console.error('Error creating block:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Get a specific block
 * GET /api/workspace/blocks/:id
 */
router.get('/blocks/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await getSessionFromRequest(req);
    
    if (!session?.user?.id) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    const block = await prisma.workspaceBlock.findFirst({
      where: {
        id: req.params.id,
        board: {
          userId: session.user.id,
        },
      },
      include: {
        docsPages: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
        kanbanColumns: {
          include: {
            cards: {
              orderBy: {
                orderIndex: 'asc',
              },
            },
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
        frasesItems: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!block) {
      res.status(404).json({ error: 'Bloque no encontrado' });
      return;
    }

    // Map database fields to frontend expected fields
    const mappedBlock = mapBlockFields(block);

    res.json({ block: mappedBlock });
  } catch (error) {
    console.error('Error fetching block:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Update a block
 * PATCH /api/workspace/blocks/:id
 */
router.patch('/blocks/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await getSessionFromRequest(req);
    
    if (!session?.user?.id) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    // Verify block belongs to user
    const existingBlock = await prisma.workspaceBlock.findFirst({
      where: {
        id: req.params.id,
        board: {
          userId: session.user.id,
        },
      },
    });

    if (!existingBlock) {
      res.status(404).json({ error: 'Bloque no encontrado' });
      return;
    }

    // Map frontend fields back to database fields if they exist
    const updateData: any = { ...req.body };
    if (updateData.width !== undefined) {
      updateData.w = updateData.width;
      delete updateData.width;
    }
    if (updateData.height !== undefined) {
      updateData.h = updateData.height;
      delete updateData.height;
    }
    if (updateData.completed !== undefined) {
      updateData.locked = updateData.completed;
      delete updateData.completed;
    }

    const block = await prisma.workspaceBlock.update({
      where: {
        id: req.params.id,
      },
      data: updateData,
      include: {
        docsPages: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
        kanbanColumns: {
          include: {
            cards: {
              orderBy: {
                orderIndex: 'asc',
              },
            },
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
        frasesItems: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    // Map database fields to frontend expected fields
    const mappedBlock = mapBlockFields(block);

    res.json({ block: mappedBlock });
  } catch (error) {
    console.error('Error updating block:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Delete a block
 * DELETE /api/workspace/blocks/:id
 */
router.delete('/blocks/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await getSessionFromRequest(req);
    
    if (!session?.user?.id) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    // Verify block belongs to user
    const block = await prisma.workspaceBlock.findFirst({
      where: {
        id: req.params.id,
        board: {
          userId: session.user.id,
        },
      },
    });

    if (!block) {
      res.status(404).json({ error: 'Bloque no encontrado' });
      return;
    }

    await prisma.workspaceBlock.delete({
      where: {
        id: req.params.id,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting block:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Docs routes
/**
 * Get docs pages for a block
 * GET /api/workspace/docs/:blockId
 */
router.get('/docs/:blockId', async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await getSessionFromRequest(req);
    
    if (!session?.user?.id) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    // Verify block belongs to user
    const block = await prisma.workspaceBlock.findFirst({
      where: {
        id: req.params.blockId,
        board: {
          userId: session.user.id,
        },
      },
    });

    if (!block) {
      res.status(404).json({ error: 'Bloque no encontrado' });
      return;
    }

    const pages = await prisma.docsPage.findMany({
      where: {
        blockId: req.params.blockId,
      },
      orderBy: {
        orderIndex: 'asc',
      },
    });

    res.json({ pages });
  } catch (error) {
    console.error('Error fetching docs pages:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Create a new docs page
 * POST /api/workspace/docs/:blockId
 */
router.post('/docs/:blockId', async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await getSessionFromRequest(req);
    
    if (!session?.user?.id) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    // Verify block belongs to user
    const block = await prisma.workspaceBlock.findFirst({
      where: {
        id: req.params.blockId,
        board: {
          userId: session.user.id,
        },
      },
    });

    if (!block) {
      res.status(404).json({ error: 'Bloque no encontrado' });
      return;
    }

    // Get the next order index
    const lastPage = await prisma.docsPage.findFirst({
      where: {
        blockId: req.params.blockId,
      },
      orderBy: {
        orderIndex: 'desc',
      },
    });

    const page = await prisma.docsPage.create({
      data: {
        blockId: req.params.blockId,
        title: req.body.title || 'Nueva página',
        content: req.body.content || '',
        orderIndex: (lastPage?.orderIndex || 0) + 1,
      },
    });

    res.json({ page });
  } catch (error) {
    console.error('Error creating docs page:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Update a docs page
 * PATCH /api/workspace/docs/:blockId/:pageId
 */
router.patch('/docs/:blockId/:pageId', async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await getSessionFromRequest(req);
    
    if (!session?.user?.id) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    // Verify block belongs to user
    const block = await prisma.workspaceBlock.findFirst({
      where: {
        id: req.params.blockId,
        board: {
          userId: session.user.id,
        },
      },
    });

    if (!block) {
      res.status(404).json({ error: 'Bloque no encontrado' });
      return;
    }

    const page = await prisma.docsPage.update({
      where: {
        id: req.params.pageId,
      },
      data: req.body,
    });

    res.json({ page });
  } catch (error) {
    console.error('Error updating docs page:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Delete a docs page
 * DELETE /api/workspace/docs/:blockId/:pageId
 */
router.delete('/docs/:blockId/:pageId', async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await getSessionFromRequest(req);
    
    if (!session?.user?.id) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    // Verify block belongs to user
    const block = await prisma.workspaceBlock.findFirst({
      where: {
        id: req.params.blockId,
        board: {
          userId: session.user.id,
        },
      },
    });

    if (!block) {
      res.status(404).json({ error: 'Bloque no encontrado' });
      return;
    }

    await prisma.docsPage.delete({
      where: {
        id: req.params.pageId,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting docs page:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Kanban routes
/**
 * Get kanban columns for a block
 * GET /api/workspace/kanban/:blockId
 */
router.get('/kanban/:blockId', async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await getSessionFromRequest(req);
    
    if (!session?.user?.id) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    // Verify block belongs to user
    const block = await prisma.workspaceBlock.findFirst({
      where: {
        id: req.params.blockId,
        board: {
          userId: session.user.id,
        },
      },
    });

    if (!block) {
      res.status(404).json({ error: 'Bloque no encontrado' });
      return;
    }

    const columns = await prisma.kanbanColumn.findMany({
      where: {
        blockId: req.params.blockId,
      },
      include: {
        cards: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
      orderBy: {
        orderIndex: 'asc',
      },
    });

    res.json({ columns });
  } catch (error) {
    console.error('Error fetching kanban columns:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Create a new kanban column
 * POST /api/workspace/kanban/:blockId/columns
 */
router.post('/kanban/:blockId/columns', async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await getSessionFromRequest(req);
    
    if (!session?.user?.id) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    // Verify block belongs to user
    const block = await prisma.workspaceBlock.findFirst({
      where: {
        id: req.params.blockId,
        board: {
          userId: session.user.id,
        },
      },
    });

    if (!block) {
      res.status(404).json({ error: 'Bloque no encontrado' });
      return;
    }

    // Get the next order index
    const lastColumn = await prisma.kanbanColumn.findFirst({
      where: {
        blockId: req.params.blockId,
      },
      orderBy: {
        orderIndex: 'desc',
      },
    });

    const column = await prisma.kanbanColumn.create({
      data: {
        blockId: req.params.blockId,
        title: req.body.title || 'Nueva columna',
        orderIndex: (lastColumn?.orderIndex || 0) + 1,
      },
      include: {
        cards: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });

    res.json({ column });
  } catch (error) {
    console.error('Error creating kanban column:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Create a new kanban card
 * POST /api/workspace/kanban/:blockId/cards
 */
router.post('/kanban/:blockId/cards', async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await getSessionFromRequest(req);
    
    if (!session?.user?.id) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    // Verify block belongs to user
    const block = await prisma.workspaceBlock.findFirst({
      where: {
        id: req.params.blockId,
        board: {
          userId: session.user.id,
        },
      },
    });

    if (!block) {
      res.status(404).json({ error: 'Bloque no encontrado' });
      return;
    }

    // Get the next order index for the column
    const lastCard = await prisma.kanbanCard.findFirst({
      where: {
        columnId: req.body.columnId,
      },
      orderBy: {
        orderIndex: 'desc',
      },
    });

    const card = await prisma.kanbanCard.create({
      data: {
        columnId: req.body.columnId,
        title: req.body.title || 'Nueva tarjeta',
        description: req.body.description || '',
        orderIndex: (lastCard?.orderIndex || 0) + 1,
      },
    });

    res.json({ card });
  } catch (error) {
    console.error('Error creating kanban card:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Update a kanban card
 * PATCH /api/workspace/kanban/:blockId/cards/:cardId
 */
router.patch('/kanban/:blockId/cards/:cardId', async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await getSessionFromRequest(req);
    
    if (!session?.user?.id) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    // Verify block belongs to user
    const block = await prisma.workspaceBlock.findFirst({
      where: {
        id: req.params.blockId,
        board: {
          userId: session.user.id,
        },
      },
    });

    if (!block) {
      res.status(404).json({ error: 'Bloque no encontrado' });
      return;
    }

    const card = await prisma.kanbanCard.update({
      where: {
        id: req.params.cardId,
      },
      data: req.body,
    });

    res.json({ card });
  } catch (error) {
    console.error('Error updating kanban card:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Frases routes
/**
 * Get frases items for a block
 * GET /api/workspace/frases/:blockId
 */
router.get('/frases/:blockId', async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await getSessionFromRequest(req);
    
    if (!session?.user?.id) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    // Verify block belongs to user
    const block = await prisma.workspaceBlock.findFirst({
      where: {
        id: req.params.blockId,
        board: {
          userId: session.user.id,
        },
      },
    });

    if (!block) {
      res.status(404).json({ error: 'Bloque no encontrado' });
      return;
    }

    const items = await prisma.frasesItem.findMany({
      where: {
        blockId: req.params.blockId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ items });
  } catch (error) {
    console.error('Error fetching frases items:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Create a new frases item
 * POST /api/workspace/frases/:blockId
 */
router.post('/frases/:blockId', async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await getSessionFromRequest(req);
    
    if (!session?.user?.id) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    // Verify block belongs to user
    const block = await prisma.workspaceBlock.findFirst({
      where: {
        id: req.params.blockId,
        board: {
          userId: session.user.id,
        },
      },
    });

    if (!block) {
      res.status(404).json({ error: 'Bloque no encontrado' });
      return;
    }

    const item = await prisma.frasesItem.create({
      data: {
        blockId: req.params.blockId,
        content: req.body.content || '',
        tags: req.body.tags || [],
      },
    });

    res.json({ item });
  } catch (error) {
    console.error('Error creating frases item:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Update a frases item
 * PATCH /api/workspace/frases/:blockId/:itemId
 */
router.patch('/frases/:blockId/:itemId', async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await getSessionFromRequest(req);
    
    if (!session?.user?.id) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    // Verify block belongs to user
    const block = await prisma.workspaceBlock.findFirst({
      where: {
        id: req.params.blockId,
        board: {
          userId: session.user.id,
        },
      },
    });

    if (!block) {
      res.status(404).json({ error: 'Bloque no encontrado' });
      return;
    }

    const item = await prisma.frasesItem.update({
      where: {
        id: req.params.itemId,
      },
      data: req.body,
    });

    res.json({ item });
  } catch (error) {
    console.error('Error updating frases item:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Delete a frases item
 * DELETE /api/workspace/frases/:blockId/:itemId
 */
router.delete('/frases/:blockId/:itemId', async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await getSessionFromRequest(req);
    
    if (!session?.user?.id) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    // Verify block belongs to user
    const block = await prisma.workspaceBlock.findFirst({
      where: {
        id: req.params.blockId,
        board: {
          userId: session.user.id,
        },
      },
    });

    if (!block) {
      res.status(404).json({ error: 'Bloque no encontrado' });
      return;
    }

    await prisma.frasesItem.delete({
      where: {
        id: req.params.itemId,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting frases item:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;