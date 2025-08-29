import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateBoardDto, UpdateBoardDto } from './dto/board.dto';

const prisma = new PrismaClient();

@Injectable()
export class BoardsService {
  async getBoards(userId: string) {
    return prisma.workspaceBoard.findMany({
      where: { userId },
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getBoardById(id: string, userId: string) {
    const board = await prisma.workspaceBoard.findFirst({
      where: { id, userId },
      include: {
        blocks: {
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
        },
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return board;
  }

  async createBoard(createBoardDto: CreateBoardDto, userId: string) {
    // If this is the first board, make it default
    const existingBoards = await prisma.workspaceBoard.count({
      where: { userId },
    });

    const isDefault = existingBoards === 0 || createBoardDto.isDefault;

    // If setting as default, unset other default boards
    if (isDefault) {
      await prisma.workspaceBoard.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.workspaceBoard.create({
      data: {
        name: createBoardDto.name,
        isDefault,
        userId,
      },
      include: {
        blocks: true,
      },
    });
  }

  async updateBoard(id: string, updateBoardDto: UpdateBoardDto, userId: string) {
    const board = await prisma.workspaceBoard.findFirst({
      where: { id, userId },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    // If setting as default, unset other default boards
    if (updateBoardDto.isDefault) {
      await prisma.workspaceBoard.updateMany({
        where: { userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return prisma.workspaceBoard.update({
      where: { id },
      data: updateBoardDto,
      include: {
        blocks: true,
      },
    });
  }

  async deleteBoard(id: string, userId: string) {
    const board = await prisma.workspaceBoard.findFirst({
      where: { id, userId },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    // Don't allow deleting the last board
    const boardCount = await prisma.workspaceBoard.count({
      where: { userId },
    });

    if (boardCount === 1) {
      throw new ForbiddenException('Cannot delete the last board');
    }

    await prisma.workspaceBoard.delete({
      where: { id },
    });

    // If deleted board was default, make another board default
    if (board.isDefault) {
      const firstBoard = await prisma.workspaceBoard.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });

      if (firstBoard) {
        await prisma.workspaceBoard.update({
          where: { id: firstBoard.id },
          data: { isDefault: true },
        });
      }
    }

    return { message: 'Board deleted successfully' };
  }
}