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
  @ApiQuery({
    name: 'jobAdId',
    required: false,
    description: 'Filter resumes by job advertisement',
  })
  @ApiResponse({ status: 200, description: 'List of generated resumes.' })
  list(
    @Query('jobAdId') jobAdId: string | undefined,
    @CurrentUser() user: { userId: string },
  ) {
    return this.resumesService.list(user.userId, jobAdId);
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
      dto.language,
    );
  }

  @Get('preview/:previewId')
  @ApiOperation({ summary: 'Preview/download a generated resume' })
  @ApiQuery({
    name: 'download',
    required: false,
    description: 'Set to 1 to force attachment download',
  })
  @ApiResponse({ status: 200, description: 'PDF file stream.' })
  @ApiResponse({ status: 404, description: 'Resume not found.' })
  async preview(
    @Param('previewId') previewId: string,
    @Query('download') download: string | undefined,
    @CurrentUser() user: { userId: string },
    @Res() res: Response,
  ) {
    const data = await this.resumesService.preview(previewId, user.userId);
    const filePath = await this.resumesService.getFilePath(
      previewId,
      user.userId,
    );

    const isDownload = download === '1' || download === 'true';
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${
        isDownload ? 'attachment' : 'inline'
      }; filename="${data.filename}"`,
    });

    createReadStream(filePath).pipe(res);
  }
}
