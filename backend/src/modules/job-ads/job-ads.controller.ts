import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { JobAdsService } from './job-ads.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SkipEmailVerification } from '../../common/decorators/public.decorator';
import { CreateJobAdDto } from './dto/create-job-ad.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('job-ads')
@Controller('v1/job-ads')
@ApiBearerAuth('bearerAuth')
@SkipEmailVerification()
export class JobAdsController {
  constructor(private readonly jobAdsService: JobAdsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new job advertisement' })
  @ApiBody({ type: CreateJobAdDto })
  @ApiResponse({ status: 201, description: 'Job advertisement created.' })
  create(
    @Body() dto: CreateJobAdDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.jobAdsService.create(user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all job advertisements for authenticated user' })
  @ApiResponse({ status: 200, description: 'List of job advertisements.' })
  findAll(@CurrentUser() user: { userId: string }) {
    return this.jobAdsService.findAllByUserId(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a job advertisement by ID' })
  @ApiResponse({ status: 200, description: 'Job advertisement details.' })
  @ApiResponse({ status: 404, description: 'Job advertisement not found.' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.jobAdsService.findByIdAndUserId(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a job advertisement' })
  @ApiBody({ type: CreateJobAdDto })
  @ApiResponse({ status: 200, description: 'Job advertisement updated.' })
  @ApiResponse({ status: 404, description: 'Job advertisement not found.' })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateJobAdDto>,
    @CurrentUser() user: { userId: string },
  ) {
    return this.jobAdsService.update(id, user.userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a job advertisement' })
  @ApiResponse({ status: 200, description: 'Job advertisement deleted.' })
  @ApiResponse({ status: 404, description: 'Job advertisement not found.' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.jobAdsService.remove(id, user.userId);
  }
}
