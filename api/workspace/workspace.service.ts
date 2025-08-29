import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class WorkspaceService {
  async getWorkspaceOverview(userId: string) {
    const boards = await prisma.workspaceBoard.findMany({
      where: { userId },
      include: {
        blocks: {
          include: {
            docsPages: true,
            kanbanColumns: {
              include: {
                cards: true,
              },
            },
            frasesItems: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      boards,
      totalBoards: boards.length,
      totalBlocks: boards.reduce((acc, board) => acc + board.blocks.length, 0),
    };
  }

  async getWorkspaceStats(userId: string) {
    const [boardCount, blockCount, docsCount, kanbanCount, frasesCount] = await Promise.all([
      prisma.workspaceBoard.count({ where: { userId } }),
      prisma.workspaceBlock.count({
        where: {
          board: { userId },
        },
      }),
      prisma.docsPage.count({
        where: {
          block: {
            board: { userId },
          },
        },
      }),
      prisma.kanbanColumn.count({
        where: {
          block: {
            board: { userId },
          },
        },
      }),
      prisma.frasesItem.count({
        where: {
          block: {
            board: { userId },
          },
        },
      }),
    ]);

    return {
      boards: boardCount,
      blocks: blockCount,
      docs: docsCount,
      kanban: kanbanCount,
      frases: frasesCount,
    };
  }
}