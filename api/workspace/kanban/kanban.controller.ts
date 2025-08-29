import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { KanbanService } from './kanban.service';
import {
  CreateKanbanColumnDto,
  UpdateKanbanColumnDto,
  CreateKanbanCardDto,
  UpdateKanbanCardDto,
  MoveKanbanCardDto,
} from './dto/kanban.dto';
import { AuthGuard } from '../../guards/auth.guard';

@ApiTags('workspace-kanban')
@Controller('workspace/kanban')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class KanbanController {
  constructor(private readonly kanbanService: KanbanService) {}

  // Column operations
  @Get('block/:blockId/columns')
  @ApiOperation({ summary: 'Get kanban columns by block ID' })
  @ApiResponse({ status: 200, description: 'Kanban columns retrieved successfully' })
  async getColumnsByBlockId(@Param('blockId') blockId: string, @Request() req: any) {
    const userId = req.user.id;
    return this.kanbanService.getColumnsByBlockId(blockId, userId);
  }

  @Post('columns')
  @ApiOperation({ summary: 'Create a new kanban column' })
  @ApiResponse({ status: 201, description: 'Kanban column created successfully' })
  async createColumn(@Body() createColumnDto: CreateKanbanColumnDto, @Request() req: any) {
    const userId = req.user.id;
    return this.kanbanService.createColumn(createColumnDto, userId);
  }

  @Put('columns/:id')
  @ApiOperation({ summary: 'Update kanban column' })
  @ApiResponse({ status: 200, description: 'Kanban column updated successfully' })
  @ApiResponse({ status: 404, description: 'Kanban column not found' })
  async updateColumn(
    @Param('id') id: string,
    @Body() updateColumnDto: UpdateKanbanColumnDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.kanbanService.updateColumn(id, updateColumnDto, userId);
  }

  @Delete('columns/:id')
  @ApiOperation({ summary: 'Delete kanban column' })
  @ApiResponse({ status: 200, description: 'Kanban column deleted successfully' })
  @ApiResponse({ status: 404, description: 'Kanban column not found' })
  async deleteColumn(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    return this.kanbanService.deleteColumn(id, userId);
  }

  // Card operations
  @Get('columns/:columnId/cards')
  @ApiOperation({ summary: 'Get kanban cards by column ID' })
  @ApiResponse({ status: 200, description: 'Kanban cards retrieved successfully' })
  async getCardsByColumnId(@Param('columnId') columnId: string, @Request() req: any) {
    const userId = req.user.id;
    return this.kanbanService.getCardsByColumnId(columnId, userId);
  }

  @Post('cards')
  @ApiOperation({ summary: 'Create a new kanban card' })
  @ApiResponse({ status: 201, description: 'Kanban card created successfully' })
  async createCard(@Body() createCardDto: CreateKanbanCardDto, @Request() req: any) {
    const userId = req.user.id;
    return this.kanbanService.createCard(createCardDto, userId);
  }

  @Put('cards/:id')
  @ApiOperation({ summary: 'Update kanban card' })
  @ApiResponse({ status: 200, description: 'Kanban card updated successfully' })
  @ApiResponse({ status: 404, description: 'Kanban card not found' })
  async updateCard(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateKanbanCardDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.kanbanService.updateCard(id, updateCardDto, userId);
  }

  @Put('cards/:id/move')
  @ApiOperation({ summary: 'Move kanban card to different column or position' })
  @ApiResponse({ status: 200, description: 'Kanban card moved successfully' })
  @ApiResponse({ status: 404, description: 'Kanban card not found' })
  async moveCard(
    @Param('id') id: string,
    @Body() moveCardDto: MoveKanbanCardDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.kanbanService.moveCard(id, moveCardDto, userId);
  }

  @Delete('cards/:id')
  @ApiOperation({ summary: 'Delete kanban card' })
  @ApiResponse({ status: 200, description: 'Kanban card deleted successfully' })
  @ApiResponse({ status: 404, description: 'Kanban card not found' })
  async deleteCard(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    return this.kanbanService.deleteCard(id, userId);
  }
}