import {
  IsString,
  IsNumber,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Column DTOs
export class CreateKanbanColumnDto {
  @ApiProperty({
    description: 'ID of the block this column belongs to',
    example: 'clx1234567890',
  })
  @IsString()
  blockId: string;

  @ApiProperty({
    description: 'Title of the kanban column',
    example: 'To Do',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  title: string;
}

export class UpdateKanbanColumnDto {
  @ApiPropertyOptional({
    description: 'Title of the kanban column',
    example: 'In Progress',
    minLength: 1,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  title?: string;

  @ApiPropertyOptional({
    description: 'Order index of the column',
    example: 1,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  orderIndex?: number;
}

// Card DTOs
export class CreateKanbanCardDto {
  @ApiProperty({
    description: 'ID of the column this card belongs to',
    example: 'clx1234567890',
  })
  @IsString()
  columnId: string;

  @ApiProperty({
    description: 'Title of the kanban card',
    example: 'Implement user authentication',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({
    description: 'Description of the kanban card',
    example: 'Add login and registration functionality with JWT tokens',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class UpdateKanbanCardDto {
  @ApiPropertyOptional({
    description: 'Title of the kanban card',
    example: 'Updated task title',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({
    description: 'Description of the kanban card',
    example: 'Updated task description with more details',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class MoveKanbanCardDto {
  @ApiPropertyOptional({
    description: 'ID of the target column (if moving to different column)',
    example: 'clx0987654321',
  })
  @IsOptional()
  @IsString()
  columnId?: string;

  @ApiProperty({
    description: 'New order index for the card',
    example: 2,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  orderIndex: number;
}