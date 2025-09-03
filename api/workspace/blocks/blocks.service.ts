import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateBlockDto, UpdateBlockDto, UpdateBlockPositionDto } from './dto/block.dto';

const prisma = new PrismaClient();

@Injectable()
export class BlocksService {
  async getBlocks(boardId: string, userId: string) {
    // Verify board ownership
    const board = await prisma.workspaceBoard.findFirst({
      where: { id: boardId, userId },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return prisma.workspaceBlock.findMany({
      where: { boardId },
      include: {
        docsPages: true,
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
        frasesItems: true,
      },
      orderBy: {
        zIndex: 'asc',
      },
    });
  }

  async getBlockById(id: string, userId: string) {
    const block = await prisma.workspaceBlock.findFirst({
      where: {
        id,
        board: { userId },
      },
      include: {
        board: true,
        docsPages: true,
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
        frasesItems: true,
      },
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    return block;
  }

  async createBlock(createBlockDto: CreateBlockDto, userId: string) {
    // Verify board ownership
    const board = await prisma.workspaceBoard.findFirst({
      where: { id: createBlockDto.boardId, userId },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    // Get the highest z-index for proper layering
    const maxZIndex = await prisma.workspaceBlock.findFirst({
      where: { boardId: createBlockDto.boardId },
      orderBy: { zIndex: 'desc' },
      select: { zIndex: true },
    });

    const newZIndex = (maxZIndex?.zIndex || 0) + 1;

    const block = await prisma.workspaceBlock.create({
      data: {
        ...createBlockDto,
        zIndex: newZIndex,
      },
      include: {
        docsPages: true,
        kanbanColumns: true,
        frasesItems: true,
      },
    });

    // Initialize default content based on block type
    await this.initializeBlockContent(block.id, createBlockDto.type);

    return this.getBlockById(block.id, userId);
  }

  async updateBlock(id: string, updateBlockDto: UpdateBlockDto, userId: string) {
    const block = await prisma.workspaceBlock.findFirst({
      where: {
        id,
        board: { userId },
      },
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    return prisma.workspaceBlock.update({
      where: { id },
      data: updateBlockDto,
      include: {
        docsPages: true,
        kanbanColumns: {
          include: {
            cards: true,
          },
        },
        frasesItems: true,
      },
    });
  }

  async updateBlockPosition(id: string, updatePositionDto: UpdateBlockPositionDto, userId: string) {
    const block = await prisma.workspaceBlock.findFirst({
      where: {
        id,
        board: { userId },
      },
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    return prisma.workspaceBlock.update({
      where: { id },
      data: updatePositionDto,
    });
  }

  async deleteBlock(id: string, userId: string) {
    const block = await prisma.workspaceBlock.findFirst({
      where: {
        id,
        board: { userId },
      },
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    await prisma.workspaceBlock.delete({
      where: { id },
    });

    return { message: 'Block deleted successfully' };
  }

  private async initializeBlockContent(blockId: string, type: string) {
    switch (type) {
      case 'DOCS':
        await prisma.docsPage.create({
          data: {
            blockId,
            title: 'Untitled Document',
            content: '',
          },
        });
        break;
      case 'KANBAN':
        // Create default columns
        await prisma.kanbanColumn.createMany({
          data: [
            { blockId, title: 'To Do', orderIndex: 0 },
            { blockId, title: 'In Progress', orderIndex: 1 },
            { blockId, title: 'Done', orderIndex: 2 },
          ],
        });
        break;
      case 'FRASES':
        // Create a default frases item
        await prisma.frasesItem.create({
          data: {
            blockId,
            content: 'Welcome to your new frases block!',
            orderIndex: 0,
          },
        });
        break;
    }
  }
}