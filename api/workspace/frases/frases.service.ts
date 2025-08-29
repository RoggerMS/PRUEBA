import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  CreateFrasesItemDto,
  UpdateFrasesItemDto,
  ReorderFrasesItemDto,
} from './dto/frases.dto';

const prisma = new PrismaClient();

@Injectable()
export class FrasesService {
  async getFrasesByBlockId(blockId: string, userId: string) {
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

    return prisma.frasesItem.findMany({
      where: { blockId },
      orderBy: {
        orderIndex: 'asc',
      },
    });
  }

  async getFrasesItemById(id: string, userId: string) {
    const frasesItem = await prisma.frasesItem.findFirst({
      where: {
        id,
        block: {
          board: { userId },
        },
      },
      include: {
        block: {
          include: {
            board: true,
          },
        },
      },
    });

    if (!frasesItem) {
      throw new NotFoundException('Frases item not found');
    }

    return frasesItem;
  }

  async createFrasesItem(createFrasesItemDto: CreateFrasesItemDto, userId: string) {
    // Verify block ownership
    const block = await prisma.workspaceBlock.findFirst({
      where: {
        id: createFrasesItemDto.blockId,
        board: { userId },
      },
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    // Get the highest order index for proper ordering
    const maxOrderIndex = await prisma.frasesItem.findFirst({
      where: { blockId: createFrasesItemDto.blockId },
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true },
    });

    const newOrderIndex = (maxOrderIndex?.orderIndex || -1) + 1;

    return prisma.frasesItem.create({
      data: {
        ...createFrasesItemDto,
        orderIndex: newOrderIndex,
      },
    });
  }

  async updateFrasesItem(id: string, updateFrasesItemDto: UpdateFrasesItemDto, userId: string) {
    const frasesItem = await prisma.frasesItem.findFirst({
      where: {
        id,
        block: {
          board: { userId },
        },
      },
    });

    if (!frasesItem) {
      throw new NotFoundException('Frases item not found');
    }

    return prisma.frasesItem.update({
      where: { id },
      data: updateFrasesItemDto,
    });
  }

  async reorderFrasesItem(id: string, reorderFrasesItemDto: ReorderFrasesItemDto, userId: string) {
    const frasesItem = await prisma.frasesItem.findFirst({
      where: {
        id,
        block: {
          board: { userId },
        },
      },
    });

    if (!frasesItem) {
      throw new NotFoundException('Frases item not found');
    }

    return prisma.frasesItem.update({
      where: { id },
      data: {
        orderIndex: reorderFrasesItemDto.orderIndex,
      },
    });
  }

  async deleteFrasesItem(id: string, userId: string) {
    const frasesItem = await prisma.frasesItem.findFirst({
      where: {
        id,
        block: {
          board: { userId },
        },
      },
    });

    if (!frasesItem) {
      throw new NotFoundException('Frases item not found');
    }

    await prisma.frasesItem.delete({
      where: { id },
    });

    return { message: 'Frases item deleted successfully' };
  }
}