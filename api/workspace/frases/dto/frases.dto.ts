import {
  IsString,
  IsNumber,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFrasesItemDto {
  @ApiProperty({
    description: 'ID of the block this frases item belongs to',
    example: 'clx1234567890',
  })
  @IsString()
  blockId: string;

  @ApiProperty({
    description: 'Content of the frases item',
    example: 'This is an inspiring quote or phrase',
    minLength: 1,
    maxLength: 500,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  content: string;

  @ApiPropertyOptional({
    description: 'Author of the frases item',
    example: 'Albert Einstein',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  author?: string;

  @ApiPropertyOptional({
    description: 'Source of the frases item',
    example: 'Relativity: The Special and General Theory',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  source?: string;

  @ApiPropertyOptional({
    description: 'Tags associated with the frases item (comma-separated)',
    example: 'inspiration,science,wisdom',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  tags?: string;
}

export class UpdateFrasesItemDto {
  @ApiPropertyOptional({
    description: 'Content of the frases item',
    example: 'Updated inspiring quote or phrase',
    minLength: 1,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  content?: string;

  @ApiPropertyOptional({
    description: 'Author of the frases item',
    example: 'Marie Curie',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  author?: string;

  @ApiPropertyOptional({
    description: 'Source of the frases item',
    example: 'Nobel Prize Speech',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  source?: string;

  @ApiPropertyOptional({
    description: 'Tags associated with the frases item (comma-separated)',
    example: 'science,perseverance,discovery',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  tags?: string;
}

export class ReorderFrasesItemDto {
  @ApiProperty({
    description: 'New order index for the frases item',
    example: 3,
    minimum: 0,
  })
  @IsNumber()
  @