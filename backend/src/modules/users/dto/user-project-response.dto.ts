import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserProjectResponseDto {
  @ApiProperty({
    example: '7ff1f17b-e48b-4592-8a77-1e7f6939a42e',
    description: 'Project entry ID',
  })
  id!: string;

  @ApiProperty({
    example: 'Portfolio Website',
    description: 'Project name',
  })
  projectName!: string;

  @ApiPropertyOptional({
    example: 'A personal portfolio built with React and Node.js.',
    description: 'Project description',
    nullable: true,
  })
  description!: string | null;

  @ApiPropertyOptional({
    example: '2023-01-01',
    description: 'Start date (YYYY-MM-DD)',
    nullable: true,
  })
  startDate!: string | null;

  @ApiPropertyOptional({
    example: '2023-06-30',
    description: 'End date (YYYY-MM-DD)',
    nullable: true,
  })
  endDate!: string | null;

  @ApiPropertyOptional({
    example: 'React, Node.js, PostgreSQL',
    description: 'Technologies used',
    nullable: true,
  })
  techStack!: string | null;

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
