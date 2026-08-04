import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateUserProjectDto {
  @ApiPropertyOptional({
    example: 'Portfolio Website',
    description: 'Project name',
  })
  @IsString()
  @IsOptional()
  projectName?: string;

  @ApiPropertyOptional({
    example: 'A personal portfolio built with React and Node.js.',
    description: 'Project description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: '2023-01-01',
    description: 'Start date (YYYY-MM-DD)',
  })
  @IsDateString({}, { message: 'startDate must be a valid date (YYYY-MM-DD)' })
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2023-06-30',
    description: 'End date (YYYY-MM-DD)',
  })
  @IsDateString({}, { message: 'endDate must be a valid date (YYYY-MM-DD)' })
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    example: 'React, Node.js, PostgreSQL',
    description: 'Technologies used',
  })
  @IsString()
  @IsOptional()
  techStack?: string;
}
