import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserWorkExperienceResponseDto {
  @ApiProperty({
    example: '0cdd3e73-2a80-42bf-a63c-c7e53ea6b9c8',
    description: 'Work experience entry ID',
  })
  id!: string;

  @ApiProperty({
    example: 'Acme Corp',
    description: 'Company name',
  })
  company!: string;

  @ApiProperty({
    example: 'Software Engineer',
    description: 'Role or job title',
  })
  role!: string;

  @ApiPropertyOptional({
    example: '2021-01-15',
    description: 'Start date (YYYY-MM-DD)',
    nullable: true,
  })
  startDate!: string | null;

  @ApiPropertyOptional({
    example: '2024-06-30',
    description: 'End date (YYYY-MM-DD)',
    nullable: true,
  })
  endDate!: string | null;

  @ApiPropertyOptional({
    example: 'Built REST APIs and microservices.',
    description: 'Description of the role',
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
