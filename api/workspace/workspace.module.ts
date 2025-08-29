import { Module } from '@nestjs/common';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';
import { BoardsController } from './boards/boards.controller';
import { BoardsService } from './boards/boards.service';
import { BlocksController } from './blocks/blocks.controller';
import { BlocksService } from './blocks/blocks.service';
import { DocsController } from './docs/docs.controller';
import { DocsService } from './docs/docs.service';
import { KanbanController } from './kanban/kanban.controller';
import { KanbanService } from './kanban/kanban.service';
import { FrasesController } from './frases/frases.controller';
import { FrasesService } from './frases/frases.service';
import { AuthGuard } from '../guards/auth.guard';

@Module({
  controllers: [
    WorkspaceController,
    BoardsController,
    BlocksController,
    DocsController,
    KanbanController,
    FrasesController,
  ],
  providers: [
    WorkspaceService,
    BoardsService,
    BlocksService,
    DocsService,
    KanbanService,
    FrasesService,
    AuthGuard,
  ],
})
export class WorkspaceModule {}