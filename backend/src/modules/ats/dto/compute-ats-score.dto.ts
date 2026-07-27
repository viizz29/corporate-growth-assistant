import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ComputeAtsScoreDto {
  @ApiProperty({
    description: 'ID of the job advertisement to score against',
  })
  @IsUUID()
  @IsNotEmpty()
  jobAdId!: string;
}
