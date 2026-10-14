import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserLanguageResponseDto {
  @ApiProperty({
    example: 'uuid',
    description: 'Language ID',
  })
  id!: string;

  @ApiProperty({
    example: 'English',
    description: 'Language name',
  })
  languageName!: string;

  @ApiPropertyOptional({
    example: 'advanced',
    description: 'Proficiency level',
  })
  proficiencyLevel?: string | null;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Created at',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Updated at',
  })
  updatedAt!: Date;
}