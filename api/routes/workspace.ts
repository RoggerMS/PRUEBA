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

    const boards = await prisma.board.findMany({
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
    
    const board = await prisma.board.create({
      data: {
        name,
        description,
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

    const blocks = await prisma.block.findMany({
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

    const { boardId, type, content, position, size } = req.body;
    
    // Verify board ownership
    const board = await prisma.board.findFirst({
      where: { id: boardId, userId }
    });
    
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const block = await prisma.block.create({
      data: {
        boardId,
        type,
        content,
        position,
        size,
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
    const existingBlock = await prisma.block.findFirst({
      where: {
        id: blockId,
        board: { userId }
      }
    });
    
    if (!existingBlock) {
      return res.status(404).json({ error: 'Block not found' });
    }

    const { type, content, position, size } = req.body;
    
    const block = await prisma.block.update({
      where: { id: blockId },
      data: {
        ...(type && { type }),
        ...(content && { content }),
        ...(position && { position }),
        ...(size && { size }),
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
    const existingBlock = await prisma.block.findFirst({
      where: {
        id: blockId,
        board: { userId }
      }
    });
    
    if (!existingBlock) {
      return res.status(404).json({ error: 'Block not found' });
    }

    await prisma.block.delete({
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

    const whereClause: any = { board: { userId } };
    if (boardId) {
      whereClause.boardId = boardId;
    }

    const pages = await prisma.docsPage.findMany({
      where: whereClause,
      include: {
        board: {
          select: { id: true, name: true }
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

    const { boardId, title, content } = req.body;
    
    // Verify board ownership
    const board = await prisma.board.findFirst({
      where: { id: boardId, userId }
    });
    
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const page = await prisma.docsPage.create({
      data: {
        boardId,
        title,
        content,
      },
      include: {
        board: {
          select: { id: true, name: true }
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

    // Verify page ownership through board
    const existingPage = await prisma.docsPage.findFirst({
      where: {
        id: pageId,
        board: { userId }
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
        board: {
          select: { id: true, name: true }
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

    // Verify page ownership through board
    const existingPage = await prisma.docsPage.findFirst({
      where: {
        id: pageId,
        board: { userId }
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