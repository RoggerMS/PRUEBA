import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Boards routes
router.get('/boards', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const boards = await prisma.workspaceBoard.findMany({
      where: { userId },
      include: {
        blocks: true,
        _count: {
          select: { blocks: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(boards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/boards', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, description } = req.body;
    
    const board = await prisma.workspaceBoard.create({
      data: {
        name,
        userId,
      },
      include: {
        blocks: true,
        _count: {
          select: { blocks: true }
        }
      }
    });

    res.status(201).json(board);
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Blocks routes
router.get('/blocks', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const boardId = req.query.boardId as string;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const whereClause: any = { board: { userId } };
    if (boardId) {
      whereClause.boardId = boardId;
    }

    const blocks = await prisma.workspaceBlock.findMany({
      where: whereClause,
      include: {
        board: {
          select: { id: true, name: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(blocks);
  } catch (error) {
    console.error('Error fetching blocks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/blocks', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { boardId, type, title, x, y, w, h } = req.body;
    
    // Verify board ownership
    const board = await prisma.workspaceBoard.findFirst({
      where: { id: boardId, userId }
    });
    
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const block = await prisma.workspaceBlock.create({
      data: {
        boardId,
        type,
        title,
        x: x || 0,
        y: y || 0,
        w: w || 300,
        h: h || 200,
      },
      include: {
        board: {
          select: { id: true, name: true }
        }
      }
    });

    res.status(201).json(block);
  } catch (error) {
    console.error('Error creating block:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/blocks/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const blockId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify block ownership through board
    const existingBlock = await prisma.workspaceBlock.findFirst({
      where: {
        id: blockId,
        board: { userId }
      }
    });
    
    if (!existingBlock) {
      return res.status(404).json({ error: 'Block not found' });
    }

    const { type, title, x, y, w, h, locked, completed } = req.body;
    
    const block = await prisma.workspaceBlock.update({
      where: { id: blockId },
      data: {
        ...(type && { type }),
        ...(title && { title }),
        ...(x !== undefined && { x }),
        ...(y !== undefined && { y }),
        ...(w !== undefined && { w }),
        ...(h !== undefined && { h }),
        ...(locked !== undefined && { locked }),
        ...(completed !== undefined && { completed }),
      },
      include: {
        board: {
          select: { id: true, name: true }
        }
      }
    });

    res.json(block);
  } catch (error) {
    console.error('Error updating block:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/blocks/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const blockId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify block ownership through board
    const existingBlock = await prisma.workspaceBlock.findFirst({
      where: {
        id: blockId,
        board: { userId }
      }
    });
    
    if (!existingBlock) {
      return res.status(404).json({ error: 'Block not found' });
    }

    await prisma.workspaceBlock.delete({
      where: { id: blockId }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting block:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Docs pages routes
router.get('/docs/pages', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const boardId = req.query.boardId as string;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const whereClause: any = { block: { board: { userId } } };
    if (boardId) {
      whereClause.block = { boardId };
    }

    const pages = await prisma.docsPage.findMany({
      where: whereClause,
      include: {
        block: {
          select: { id: true, title: true },
          include: {
            board: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(pages);
  } catch (error) {
    console.error('Error fetching docs pages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/docs/pages', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { blockId, title, content } = req.body;
    
    // Verify block ownership
    const block = await prisma.workspaceBlock.findFirst({
      where: { id: blockId, board: { userId } }
    });
    
    if (!block) {
      return res.status(404).json({ error: 'Block not found' });
    }

    const page = await prisma.docsPage.create({
      data: {
        blockId,
        title,
        content,
      },
      include: {
        block: {
          select: { id: true, title: true },
          include: {
            board: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    res.status(201).json(page);
  } catch (error) {
    console.error('Error creating docs page:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/docs/pages/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const pageId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify page ownership through block
    const existingPage = await prisma.docsPage.findFirst({
      where: {
        id: pageId,
        block: { board: { userId } }
      }
    });
    
    if (!existingPage) {
      return res.status(404).json({ error: 'Page not found' });
    }

    const { title, content } = req.body;
    
    const page = await prisma.docsPage.update({
      where: { id: pageId },
      data: {
        ...(title && { title }),
        ...(content && { content }),
      },
      include: {
        block: {
          select: { id: true, title: true },
          include: {
            board: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    res.json(page);
  } catch (error) {
    console.error('Error updating docs page:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/docs/pages/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const pageId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify page ownership through block
    const existingPage = await prisma.docsPage.findFirst({
      where: {
        id: pageId,
        block: { board: { userId } }
      }
    });
    
    if (!existingPage) {
      return res.status(404).json({ error: 'Page not found' });
    }

    await prisma.docsPage.delete({
      where: { id: pageId }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting docs page:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;