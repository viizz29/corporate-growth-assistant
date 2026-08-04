import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AtsService } from './ats.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SkipEmailVerification } from '../../common/decorators/public.decorator';
import { ComputeAtsScoreDto } from './dto/compute-ats-score.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('ats')
@Controller('v1/ats')
@ApiBearerAuth('bearerAuth')
@SkipEmailVerification()
export class AtsController {
  constructor(private readonly atsService: AtsService) {}

  @Post('score')
  @ApiOperation({ summary: 'Compute ATS score for a job advertisement' })
  @ApiBody({ type: ComputeAtsScoreDto })
  @ApiResponse({ status: 201, description: 'ATS score computed.' })
  @ApiResponse({ status: 404, description: 'Job advertisement not found.' })
  computeScore(
    @Body() dto: ComputeAtsScoreDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.atsService.compute(user.userId, dto.jobAdId);
  }

  @Get('scores')
  @ApiOperation({
    summary: "List cached ATS scores for all of the user's job advertisements",
  })
  @ApiResponse({ status: 200, description: 'ATS scores retrieved.' })
  listScores(@CurrentUser() user: { userId: string }) {
    return this.atsService.listForUser(user.userId);
  }

  @Get('score/:jobAdId')
  @ApiOperation({ summary: 'Get cached ATS score for a job advertisement' })
  @ApiResponse({ status: 200, description: 'ATS score retrieved.' })
  @ApiResponse({ status: 404, description: 'Score not found.' })
  getScore(
    @Param('jobAdId') jobAdId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.atsService.findByUserAndJobAd(user.userId, jobAdId);
  }
}
