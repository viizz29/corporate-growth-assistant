import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'john@example.com',
    description: 'The email of the user',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'John' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'en',
    description: 'Preferred language',
    enum: ['en', 'hi'],
  })
  @IsString()
  @IsIn(['en', 'hi'], { message: 'Language must be either en or hi' })
  @IsOptional()
  languagePreference?: string;

  @ApiPropertyOptional({
    example: 'light',
    description: 'Preferred theme',
    enum: ['light', 'dark'],
  })
  @IsString()
  @IsIn(['light', 'dark'], { message: 'Theme must be either light or dark' })
  @IsOptional()
  themePreference?: string;
}
