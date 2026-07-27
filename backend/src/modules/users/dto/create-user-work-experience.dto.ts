import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserWorkExperienceDto {
  @ApiProperty({
    example: 'Acme Corp',
    description: 'Company name',
  })
  @IsString()
  @IsNotEmpty()
  company!: string;

  @ApiProperty({
    example: 'Software Engineer',
    description: 'Role or job title',
  })
  @IsString()
  @IsNotEmpty()
  role!: string;

  @ApiPropertyOptional({
    example: '2021-01-15',
    description: 'Start date (YYYY-MM-DD)',
  })
  @IsDateString({}, { message: 'startDate must be a valid date (YYYY-MM-DD)' })
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2024-06-30',
    description: 'End date (YYYY-MM-DD)',
  })
  @IsDateString({}, { message: 'endDate must be a valid date (YYYY-MM-DD)' })
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    example: 'Built REST APIs and microservices.',
    description: 'Description of the role',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
