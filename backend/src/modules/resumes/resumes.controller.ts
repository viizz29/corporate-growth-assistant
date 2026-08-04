import { Controller, Get, Post, Body, Param, Query, Res } from '@nestjs/common';
import { createReadStream } from 'fs';
import type { Response } from 'express';
import { ResumesService } from './resumes.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SkipEmailVerification } from '../../common/decorators/public.decorator';
import { GenerateResumeDto } from './dto/generate-resume.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('resumes')
@Controller('v1/resumes')
@ApiBearerAuth('bearerAuth')
@SkipEmailVerification()
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Get()
  @ApiOperation({
    summary: 'List generated resumes for the authenticated user',
  })
  @ApiResponse({ status: 200, description: 'List of generated resumes.' })
  list(@CurrentUser() user: { userId: string }) {
    return this.resumesService.list(user.userId);
  }

  @Get('templates')
  @ApiOperation({ summary: 'List active resume templates' })
  @ApiQuery({
    name: 'language',
    required: false,
    enum: ['en', 'hi'],
    description: 'Filter templates by language',
  })
  @ApiResponse({ status: 200, description: 'List of active templates.' })
  listTemplates(@Query('language') language?: string) {
    return this.resumesService.listTemplates(language);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate a PDF resume' })
  @ApiBody({ type: GenerateResumeDto })
  @ApiResponse({ status: 201, description: 'Resume generated.' })
  @ApiResponse({
    status: 403,
    description: 'ATS score below threshold.',
  })
  generate(
    @Body() dto: GenerateResumeDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.resumesService.generate(
      user.userId,
      dto.jobAdId,
      dto.resumeTemplateId,
    );
  }

  @Get('preview/:previewId')
  @ApiOperation({ summary: 'Preview/download a generated resume' })
  @ApiResponse({ status: 200, description: 'PDF file stream.' })
  @ApiResponse({ status: 404, description: 'Resume not found.' })
  async preview(
    @Param('previewId') previewId: string,
    @CurrentUser() user: { userId: string },
    @Res() res: Response,
  ) {
    const data = await this.resumesService.preview(previewId, user.userId);
    const filePath = await this.resumesService.getFilePath(
      previewId,
      user.userId,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${data.filename}"`,
    });

    createReadStream(filePath).pipe(res);
  }
}
