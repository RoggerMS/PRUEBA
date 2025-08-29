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
import { FrasesService } from './frases.service';
import {
  CreateFrasesItemDto,
  UpdateFrasesItemDto,
  ReorderFrasesItemDto,
} from './dto/frases.dto';
import { AuthGuard } from '../../guards/auth.guard';

@ApiTags('workspace-frases')
@Controller('workspace/frases')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class FrasesController {
  constructor(private readonly frasesService: FrasesService) {}

  @Get('block/:blockId')
  @ApiOperation({ summary: 'Get frases items by block ID' })
  @ApiResponse({ status: 200, description: 'Frases items retrieved successfully' })
  async getFrasesByBlockId(@Param('blockId') blockId: string, @Request() req: any) {
    const userId = req.user.id;
    return this.frasesService.getFrasesByBlockId(blockId, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get frases item by ID' })
  @ApiResponse({ status: 200, description: 'Frases item retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Frases item not found' })
  async getFrasesItemById(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    return this.frasesService.getFrasesItemById(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new frases item' })
  @ApiResponse({ status: 201, description: 'Frases item created successfully' })
  async createFrasesItem(@Body() createFrasesItemDto: CreateFrasesItemDto, @Request() req: any) {
    const userId = req.user.id;
    return this.frasesService.createFrasesItem(createFrasesItemDto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update frases item' })
  @ApiResponse({ status: 200, description: 'Frases item updated successfully' })
  @ApiResponse({ status: 404, description: 'Frases item not found' })
  async updateFrasesItem(
    @Param('id') id: string,
    @Body() updateFrasesItemDto: UpdateFrasesItemDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.frasesService.updateFrasesItem(id, updateFrasesItemDto, userId);
  }

  @Put(':id/reorder')
  @ApiOperation({ summary: 'Reorder frases item' })
  @ApiResponse({ status: 200, description: 'Frases item reordered successfully' })
  @ApiResponse({ status: 404, description: 'Frases item not found' })
  async reorderFrasesItem(
    @Param('id') id: string,
    @Body() reorderFrasesItemDto: ReorderFrasesItemDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.frasesService.reorderFrasesItem(id, reorderFrasesItemDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete frases item' })
  @ApiResponse({ status: 200, description: 'Frases item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Frases item not found' })
  async deleteFrasesItem(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    return this.frasesService.deleteFrasesItem(id, userId);
  }
}