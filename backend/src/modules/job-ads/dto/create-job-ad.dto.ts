import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateJobAdDto {
  @ApiProperty({
    example: 'Senior Frontend Developer',
    description: 'Job title',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    example: 'We are looking for a senior frontend developer...',
    description: 'Job description',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    example: 'React, TypeScript, 5+ years experience',
    description: 'Job requirements',
  })
  @IsString()
  @IsNotEmpty()
  requirements!: string;

  @ApiPropertyOptional({
    example: 'Remote',
    description: 'Job location',
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    example: 'en',
    description: 'Job advertisement language',
    enum: ['en', 'hi'],
  })
  @IsString()
  @IsIn(['en', 'hi'], { message: 'Language must be either en or hi' })
  language!: string;
}
