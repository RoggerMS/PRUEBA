import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UpdateDocsPageDto } from './dto/docs.dto';

const prisma = new PrismaClient();

@Injectable()
export class DocsService {
  async getDocsPageByBlockId(blockId: string, userId: string) {
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

    const docsPage = await prisma.docsPage.findFirst({
      where: { blockId },
      include: {
        block: {
          include: {
            board: true,
          },
        },
      },
    });

    if (!docsPage) {
      throw new NotFoundException('Docs page not found');
    }

    return docsPage;
  }

  async getDocsPageById(id: string, userId: string) {
    const docsPage = await prisma.docsPage.findFirst({
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

    if (!docsPage) {
      throw new NotFoundException('Docs page not found');
    }

    return docsPage;
  }

  async updateDocsPage(id: string, updateDocsPageDto: UpdateDocsPageDto, userId: string) {
    const docsPage = await prisma.docsPage.findFirst({
      where: {
        id,
        block: {
          board: { userId },
        },
      },
    });

    if (!docsPage) {
      throw new NotFoundException('Docs page not found');
    }

    return prisma.docsPage.update({
      where: { id },
      data: {
        ...updateDocsPageDto,
        updatedAt: new Date(),
      },
      include: {
        block: {
          include: {
            board: true,
          },
        },
      },
    });
  }
}