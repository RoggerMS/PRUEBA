import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDocsPageDto {
  @ApiPropertyOptional({
    description: 'Title of the document',
    example: 'Project Requirements',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: 'Content of the document in markdown format',
    example: '# Project Overview\n\nThis document outlines the project requirements...',
  })
  @IsOptional()
  @IsString()
  content?: string;
}