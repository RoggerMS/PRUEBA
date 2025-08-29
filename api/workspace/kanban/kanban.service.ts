import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  CreateKanbanColumnDto,
  UpdateKanbanColumnDto,
  CreateKanbanCardDto,
  UpdateKanbanCardDto,
  MoveKanbanCardDto,
} from './dto/kanban.dto';

const prisma = new PrismaClient();

@Injectable()
export class KanbanService {
  // Column operations
  async getColumnsByBlockId(blockId: string, userId: string) {
    // Verify block ownership through board
    const block = await prisma.workspaceBlock.findFirst({
      where: {
        id: blockId,
        board: { userId },
      },
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    return prisma.kanbanColumn.findMany({
      where: { blockId },
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
  }

  async createColumn(createColumnDto: CreateKanbanColumnDto, userId: string) {
    // Verify block ownership
    const block = await prisma.workspaceBlock.findFirst({
      where: {
        id: createColumnDto.blockId,
        board: { userId },
      },
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    // Get the highest order index for proper ordering
    const maxOrderIndex = await prisma.kanbanColumn.findFirst({
      where: { blockId: createColumnDto.blockId },
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true },
    });

    const newOrderIndex = (maxOrderIndex?.orderIndex || -1) + 1;

    return prisma.kanbanColumn.create({
      data: {
        ...createColumnDto,
        orderIndex: newOrderIndex,
      },
      include: {
        cards: true,
      },
    });
  }

  async updateColumn(id: string, updateColumnDto: UpdateKanbanColumnDto, userId: string) {
    const column = await prisma.kanbanColumn.findFirst({
      where: {
        id,
        block: {
          board: { userId },
        },
      },
    });

    if (!column) {
      throw new NotFoundException('Kanban column not found');
    }

    return prisma.kanbanColumn.update({
      where: { id },
      data: updateColumnDto,
      include: {
        cards: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });
  }

  async deleteColumn(id: string, userId: string) {
    const column = await prisma.kanbanColumn.findFirst({
      where: {
        id,
        block: {
          board: { userId },
        },
      },
    });

    if (!column) {
      throw new NotFoundException('Kanban column not found');
    }

    await prisma.kanbanColumn.delete({
      where: { id },
    });

    return { message: 'Kanban column deleted successfully' };
  }

  // Card operations
  async getCardsByColumnId(columnId: string, userId: string) {
    // Verify column ownership through block and board
    const column = await prisma.kanbanColumn.findFirst({
      where: {
        id: columnId,
        block: {
          board: { userId },
        },
      },
    });

    if (!column) {
      throw new NotFoundException('Kanban column not found');
    }

    return prisma.kanbanCard.findMany({
      where: { columnId },
      orderBy: {
        orderIndex: 'asc',
      },
    });
  }

  async createCard(createCardDto: CreateKanbanCardDto, userId: string) {
    // Verify column ownership
    const column = await prisma.kanbanColumn.findFirst({
      where: {
        id: createCardDto.columnId,
        block: {
          board: { userId },
        },
      },
    });

    if (!column) {
      throw new NotFoundException('Kanban column not found');
    }

    // Get the highest order index for proper ordering
    const maxOrderIndex = await prisma.kanbanCard.findFirst({
      where: { columnId: createCardDto.columnId },
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true },
    });

    const newOrderIndex = (maxOrderIndex?.orderIndex || -1) + 1;

    return prisma.kanbanCard.create({
      data: {
        ...createCardDto,
        orderIndex: newOrderIndex,
      },
    });
  }

  async updateCard(id: string, updateCardDto: UpdateKanbanCardDto, userId: string) {
    const card = await prisma.kanbanCard.findFirst({
      where: {
        id,
        column: {
          block: {
            board: { userId },
          },
        },
      },
    });

    if (!card) {
      throw new NotFoundException('Kanban card not found');
    }

    return prisma.kanbanCard.update({
      where: { id },
      data: updateCardDto,
    });
  }

  async moveCard(id: string, moveCardDto: MoveKanbanCardDto, userId: string) {
    const card = await prisma.kanbanCard.findFirst({
      where: {
        id,
        column: {
          block: {
            board: { userId },
          },
        },
      },
    });

    if (!card) {
      throw new NotFoundException('Kanban card not found');
    }

    // Verify target column ownership if moving to different column
    if (moveCardDto.columnId && moveCardDto.columnId !== card.columnId) {
      const targetColumn = await prisma.kanbanColumn.findFirst({
        where: {
          id: moveCardDto.columnId,
          block: {
            board: { userId },
          },
        },
      });

      if (!targetColumn) {
        throw new NotFoundException('Target kanban column not found');
      }
    }

    // Update card position and column
    return prisma.kanbanCard.update({
      where: { id },
      data: {
        columnId: moveCardDto.columnId || card.columnId,
        orderIndex: moveCardDto.orderIndex,
      },
    });
  }

  async deleteCard(id: string, userId: string) {
    const card = await prisma.kanbanCard.findFirst({
      where: {
        id,
        column: {
          block: {
            board: { userId },
          },
        },
      },
    });

    if (!card) {
      throw new NotFoundException('Kanban card not found');
    }

    await prisma.kanbanCard.delete({
      where: { id },
    });

    return { message: 'Kanban card deleted successfully' };
  }
}