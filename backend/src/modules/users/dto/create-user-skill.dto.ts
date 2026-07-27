import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserSkillDto {
  @ApiProperty({
    example: 'TypeScript',
    description: 'Skill name',
  })
  @IsString()
  @IsNotEmpty()
  skillName!: string;

  @ApiPropertyOptional({
    example: 'advanced',
    description: 'Proficiency level (e.g., beginner, intermediate, advanced)',
  })
  @IsString()
  @IsOptional()
  proficiencyLevel?: string;
}
