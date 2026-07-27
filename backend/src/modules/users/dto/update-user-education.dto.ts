import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateUserEducationDto {
  @ApiPropertyOptional({
    example: 'MIT',
    description: 'Name of the institution',
  })
  @IsString()
  @IsOptional()
  institution?: string;

  @ApiPropertyOptional({
    example: 'MSc',
    description: 'Degree obtained or pursued',
  })
  @IsString()
  @IsOptional()
  degree?: string;

  @ApiPropertyOptional({
    example: 'Computer Science',
    description: 'Field of study',
  })
  @IsString()
  @IsOptional()
  fieldOfStudy?: string;

  @ApiPropertyOptional({
    example: '2018-08-01',
    description: 'Start date (YYYY-MM-DD)',
  })
  @IsDateString({}, { message: 'startDate must be a valid date (YYYY-MM-DD)' })
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2022-05-31',
    description: 'End date (YYYY-MM-DD)',
  })
  @IsDateString({}, { message: 'endDate must be a valid date (YYYY-MM-DD)' })
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    example: 'Studied algorithms and machine learning.',
    description: 'Additional details about the education',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
