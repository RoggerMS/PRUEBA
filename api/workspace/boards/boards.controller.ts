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
import { BoardsService } from './boards.service';
import { CreateBoardDto, UpdateBoardDto } from './dto/board.dto';
import { AuthGuard } from '../../guards/auth.guard';

@ApiTags('workspace-boards')
@Controller('workspace/boards')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all boards for authenticated user' })
  @ApiResponse({ status: 200, description: 'Boards retrieved successfully' })
  async getBoards(@Request() req: any) {
    const userId = req.user.id;
    return this.boardsService.getBoards(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get board by ID' })
  @ApiResponse({ status: 200, description: 'Board retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Board not found' })
  async getBoardById(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    return this.boardsService.getBoardById(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new board' })
  @ApiResponse({ status: 201, description: 'Board created successfully' })
  async createBoard(@Body() createBoardDto: CreateBoardDto, @Request() req: any) {
    const userId = req.user.id;
    return this.boardsService.createBoard(createBoardDto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update board' })
  @ApiResponse({ status: 200, description: 'Board updated successfully' })
  @ApiResponse({ status: 404, description: 'Board not found' })
  async updateBoard(
    @Param('id') id: string,
    @Body() updateBoardDto: UpdateBoardDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.boardsService.updateBoard(id, updateBoardDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete board' })
  @ApiResponse({ status: 200, description: 'Board deleted successfully' })
  @ApiResponse({ status: 404, description: 'Board not found' })
  async deleteBoard(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    return this.boardsService.deleteBoard(id, userId);
  }
}