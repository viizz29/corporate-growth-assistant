import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserLanguageDto {
  @ApiPropertyOptional({
    example: 'English',
    description: 'Language name',
  })
  @IsString()
  @IsOptional()
  languageName?: string;

  @ApiPropertyOptional({
    example: 'advanced',
    description: 'Proficiency level (e.g., beginner, intermediate, advanced, native)',
  })
  @IsString()
  @IsOptional()
  proficiencyLevel?: string | null;
}