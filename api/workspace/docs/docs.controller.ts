import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DocsService } from './docs.service';
import { UpdateDocsPageDto } from './dto/docs.dto';
import { AuthGuard } from '../../guards/auth.guard';

@ApiTags('workspace-docs')
@Controller('workspace/docs')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class DocsController {
  constructor(private readonly docsService: DocsService) {}

  @Get('block/:blockId')
  @ApiOperation({ summary: 'Get docs page by block ID' })
  @ApiResponse({ status: 200, description: 'Docs page retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Docs page not found' })
  async getDocsPageByBlockId(@Param('blockId') blockId: string, @Request() req: any) {
    const userId = req.user.id;
    return this.docsService.getDocsPageByBlockId(blockId, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get docs page by ID' })
  @ApiResponse({ status: 200, description: 'Docs page retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Docs page not found' })
  async getDocsPageById(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    return this.docsService.getDocsPageById(id, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update docs page' })
  @ApiResponse({ status: 200, description: 'Docs page updated successfully' })
  @ApiResponse({ status: 404, description: 'Docs page not found' })
  async updateDocsPage(
    @Param('id') id: string,
    @Body() updateDocsPageDto: UpdateDocsPageDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.docsService.updateDocsPage(id, updateDocsPageDto, userId);
  }
}