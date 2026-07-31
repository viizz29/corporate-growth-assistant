import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserEducationResponseDto {
  @ApiProperty({
    example: 'c8d4a5ea-6d4e-4b70-8d3a-2f9b1ef2a8d9',
    description: 'Education entry ID',
  })
  id!: string;

  @ApiProperty({
    example: 'MIT',
    description: 'Name of the institution',
  })
  institution!: string;

  @ApiPropertyOptional({
    example: 'BSc',
    description: 'Degree obtained or pursued',
    nullable: true,
  })
  degree!: string | null;

  @ApiPropertyOptional({
    example: 'Computer Science',
    description: 'Field of study',
    nullable: true,
  })
  fieldOfStudy!: string | null;

  @ApiPropertyOptional({
    example: '2018-08-01',
    description: 'Start date (YYYY-MM-DD)',
    nullable: true,
  })
  startDate!: string | null;

  @ApiPropertyOptional({
    example: '2022-05-31',
    description: 'End date (YYYY-MM-DD)',
    nullable: true,
  })
  endDate!: string | null;

  @ApiPropertyOptional({
    example: 'Studied algorithms and machine learning.',
    description: 'Additional details about the education',
    nullable: true,
  })
  description!: string | null;

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
