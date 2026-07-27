import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class GenerateResumeDto {
  @ApiProperty({
    description: 'ID of the job advertisement to generate resume for',
  })
  @IsUUID()
  @IsNotEmpty()
  jobAdId!: string;

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
