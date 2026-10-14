import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserLanguageDto {
  @ApiProperty({
    example: 'English',
    description: 'Language name',
  })
  @IsString()
  @IsNotEmpty()
  languageName!: string;

  @ApiPropertyOptional({
    example: 'advanced',
    description: 'Proficiency level (e.g., beginner, intermediate, advanced, native)',
  })
  @IsString()
  @IsOptional()
  proficiencyLevel?: string;
}