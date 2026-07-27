import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateUserWorkExperienceDto {
  @ApiPropertyOptional({
    example: 'Acme Corp',
    description: 'Company name',
  })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiPropertyOptional({
    example: 'Senior Software Engineer',
    description: 'Role or job title',
  })
  @IsString()
  @IsOptional()
  role?: string;

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
