import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
import { UserGender } from '../user-contact-details.model';

export class UpdateContactDetailsDto {
  @ApiPropertyOptional({
    example: 'john@example.com',
    description: 'The email of the user',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255)
  email?: string | null;

  @ApiPropertyOptional({
    example: '+911231231231',
    description: 'The phone number of the user',
  })
  @Matches(/^\+[1-9]\d{0,2}\d{6,14}$/, {
    message:
      'phone must start with + and a valid country code, followed by the phone number (e.g., +919876543210)',
  })
  @Length(9, 16)
  @IsOptional()
  phone?: string | null;

  @ApiPropertyOptional({
    example: 'Male',
    description: 'The gender of the user',
  })
  @IsOptional()
  @IsEnum(UserGender, {
    message: 'gender must be Male, Female, or Others',
  })
  gender?: UserGender | null;

  @ApiPropertyOptional({
    example: 'https://abc.xyz.com/abab',
    description: 'The github url of the user',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @IsUrl(
    { require_protocol: true },
    { message: 'githubUrl must be a valid URL including the protocol' },
  )
  githubUrl?: string | null;

  @ApiPropertyOptional({
    example: 'https://abc.xyz.com/abab',
    description: 'The linkedin url of the user',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @IsUrl(
    { require_protocol: true },
    { message: 'linkedinUrl must be a valid URL including the protocol' },
  )
  linkedinUrl?: string | null;
}
