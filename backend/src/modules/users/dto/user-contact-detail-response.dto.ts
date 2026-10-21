import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserGender } from '../user-contact-details.model';

export class UserContactDetailResponseDto {
  @ApiPropertyOptional({
    example: 'john@example.com',
    description: 'The email of the user',
  })
  email?: string | null;

  @ApiPropertyOptional({
    example: '+911231231231',
    description: 'The phone number of the user',
  })
  phone?: string | null;

  @ApiPropertyOptional({
    example: 'Male',
    description: 'The gender of the user',
  })
  gender?: UserGender | null;

  @ApiPropertyOptional({
    example: 'https://abc.xyz.com/abab',
    description: 'The github url of the user',
  })
  githubUrl?: string | null;

  @ApiPropertyOptional({
    example: 'https://abc.xyz.com/abab',
    description: 'The linkedin url of the user',
  })
  linkedinUrl?: string | null;
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
