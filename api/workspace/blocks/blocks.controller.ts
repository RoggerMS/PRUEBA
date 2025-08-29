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
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BlocksService } from './blocks.service';
import { CreateBlockDto, UpdateBlockDto, UpdateBlockPositionDto } from './dto/block.dto';
import { AuthGuard } from '../../guards/auth.guard';

@ApiTags('workspace-blocks')
@Controller('workspace/blocks')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Get()
  @ApiOperation({ summary: 'Get blocks by board ID' })
  @ApiQuery({ name: 'boardId', required: true, description: 'Board ID to get blocks from' })
  @ApiResponse({ status: 200, description: 'Blocks retrieved successfully' })
  async getBlocks(@Query('boardId') boardId: string, @Request() req: any) {
    const userId = req.user.id;
    return this.blocksService.getBlocks(boardId, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get block by ID' })
  @ApiResponse({ status: 200, description: 'Block retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Block not found' })
  async getBlockById(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    return this.blocksService.getBlockById(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new block' })
  @ApiResponse({ status: 201, description: 'Block created successfully' })
  async createBlock(@Body() createBlockDto: CreateBlockDto, @Request() req: any) {
    const userId = req.user.id;
    return this.blocksService.createBlock(createBlockDto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update block' })
  @ApiResponse({ status: 200, description: 'Block updated successfully' })
  @ApiResponse({ status: 404, description: 'Block not found' })
  async updateBlock(
    @Param('id') id: string,
    @Body() updateBlockDto: UpdateBlockDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.blocksService.updateBlock(id, updateBlockDto, userId);
  }

  @Put(':id/position')
  @ApiOperation({ summary: 'Update block position and size' })
  @ApiResponse({ status: 200, description: 'Block position updated successfully' })
  @ApiResponse({ status: 404, description: 'Block not found' })
  async updateBlockPosition(
    @Param('id') id: string,
    @Body() updatePositionDto: UpdateBlockPositionDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.blocksService.updateBlockPosition(id, updatePositionDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete block' })
  @ApiResponse({ status: 200, description: 'Block deleted successfully' })
  @ApiResponse({ status: 404, description: 'Block not found' })
  async deleteBlock(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    return this.blocksService.deleteBlock(id, userId);
  }
}