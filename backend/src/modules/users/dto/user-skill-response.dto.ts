import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserSkillResponseDto {
  @ApiProperty({
    example: 'f830f40a-8f2c-4b5b-a1de-c58bc3b4d73d',
    description: 'Skill entry ID',
  })
  id!: string;

  @ApiProperty({
    example: 'TypeScript',
    description: 'Skill name',
  })
  skillName!: string;

  @ApiPropertyOptional({
    example: 'advanced',
    description: 'Proficiency level (e.g., beginner, intermediate, advanced)',
    nullable: true,
  })
  proficiencyLevel!: string | null;

  @ApiProperty({
    example: '2026-07-29T12:00:00.000Z',
    description: 'Creation timestamp',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-07-29T12:00:00.000Z',
    description: 'Last update timestamp',
  })
  updatedAt!: Date;
}
