import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WorkspaceService } from './workspace.service';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('workspace')
@Controller('workspace')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get workspace overview for authenticated user' })
  @ApiResponse({ status: 200, description: 'Workspace overview retrieved successfully' })
  async getWorkspaceOverview(@Request() req: any) {
    const userId = req.user.id;
    return this.workspaceService.getWorkspaceOverview(userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get workspace statistics' })
  @ApiResponse({ status: 200, description: 'Workspace statistics retrieved successfully' })
  async getWorkspaceStats(@Request() req: any) {
    const userId = req.user.id;
    return this.workspaceService.getWorkspaceStats(userId);
  }
}