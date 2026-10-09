import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class GenerateGeneralResumeDto {
  @ApiProperty({
    description: 'ID of the resume template to use',
  })
  @IsUUID()
  @IsNotEmpty()
  resumeTemplateId!: string;

  @ApiProperty({
    example: 'en',
    description: 'Language for the resume',
    enum: ['en', 'hi'],
    required: false,
  })
  @IsString()
  @IsOptional()
  language?: string;
}
