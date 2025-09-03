import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsIn,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const BLOCK_TYPES = ['DOCS', 'KANBAN', 'FRASES'] as const;

export class CreateBlockDto {
  @ApiProperty({
    description: 'ID of the board this block belongs to',
    example: 'clx1234567890',
  })
  @IsString()
  boardId: string;

  @ApiProperty({
    description: 'Type of the block',
    enum: BLOCK_TYPES,
    example: 'DOCS',
  })
  @IsString()
  @IsIn(BLOCK_TYPES)
  type: string;

  @ApiProperty({
    description: 'Title of the block',
    example: 'My Document',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'X position of the block on canvas',
    example: 100,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  x: number;

  @ApiProperty({
    description: 'Y position of the block on canvas',
    example: 100,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  y: number;

  @ApiProperty({
    description: 'Width of the block',
    example: 300,
    minimum: 200,
    maximum: 1200,
  })
  @IsNumber()
  @Min(200)
  @Max(1200)
  w: number;

  @ApiProperty({
    description: 'Height of the block',
    example: 200,
    minimum: 150,
    maximum: 800,
  })
  @IsNumber()
  @Min(150)
  @Max(800)
  h: number;

  @ApiPropertyOptional({
    description: 'Whether the block is locked from editing',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  locked?: boolean;
}

export class UpdateBlockDto {
  @ApiPropertyOptional({
    description: 'Title of the block',
    example: 'Updated Document',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({
    description: 'X position of the block on canvas',
    example: 150,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  x?: number;

  @ApiPropertyOptional({
    description: 'Y position of the block on canvas',
    example: 150,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  y?: number;

  @ApiPropertyOptional({
    description: 'Width of the block',
    example: 350,
    minimum: 200,
    maximum: 1200,
  })
  @IsOptional()
  @IsNumber()
  @Min(200)
  @Max(1200)
  w?: number;

  @ApiPropertyOptional({
    description: 'Height of the block',
    example: 250,
    minimum: 150,
    maximum: 800,
  })
  @IsOptional()
  @IsNumber()
  @Min(150)
  @Max(800)
  h?: number;

  @ApiPropertyOptional({
    description: 'Z-index for layering',
    example: 5,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  zIndex?: number;

  @ApiPropertyOptional({
    description: 'Whether the block is locked from editing',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  locked?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the block is completed',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}

export class UpdateBlockPositionDto {
  @ApiProperty({
    description: 'X position of the block on canvas',
    example: 200,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  x: number;

  @ApiProperty({
    description: 'Y position of the block on canvas',
    example: 200,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  y: number;

  @ApiPropertyOptional({
    description: 'Width of the block',
    example: 400,
    minimum: 200,
    maximum: 1200,
  })
  @IsOptional()
  @IsNumber()
  @Min(200)
  @Max(1200)
  w?: number;

  @ApiPropertyOptional({
    description: 'Height of the block',
    example: 300,
    minimum: 150,
    maximum: 800,
  })
  @IsOptional()
  @IsNumber()
  @Min(150)
  @Max(800)
  h?: number;

  @ApiPropertyOptional({
    description: 'Z-index for layering',
    example: 10,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  zIndex?: number;
}