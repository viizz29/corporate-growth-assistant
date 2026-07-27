import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserSkillDto {
  @ApiPropertyOptional({
    example: 'TypeScript',
    description: 'Skill name',
  })
  @IsString()
  @IsOptional()
  skillName?: string;

  @ApiPropertyOptional({
    example: 'advanced',
    description: 'Proficiency level (e.g., beginner, intermediate, advanced)',
  })
  @IsString()
  @IsOptional()
  proficiencyLevel?: string;
}
