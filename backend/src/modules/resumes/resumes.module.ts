import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ResumeTemplate } from './resume-template.model';
import { GeneratedResume } from './generated-resume.model';
import { ResumeTemplateRepository } from './resume-template.repository';
import { GeneratedResumeRepository } from './generated-resume.repository';
import { ResumesService } from './resumes.service';
import { ResumesController } from './resumes.controller';
import { UsersModule } from '../users/users.module';
import { JobAdsModule } from '../job-ads/job-ads.module';
import { AtsModule } from '../ats/ats.module';
import { ClassicResumeRenderer } from './classic-resume.renderer';
import { ExecutiveResumeRenderer } from './executive-resume.renderer';
import { ModernResumeRenderer } from './modern-resume.renderer';
import { ResumesPdfService } from './resumes-pdf.service';
import { ResumeTailoringService } from './resume-tailoring.service';
import { OpenAiService } from '../../lib/openai.service';

@Module({
  imports: [
    SequelizeModule.forFeature([ResumeTemplate, GeneratedResume]),
    UsersModule,
    JobAdsModule,
    AtsModule,
  ],
  providers: [
    ResumeTemplateRepository,
    GeneratedResumeRepository,
    ClassicResumeRenderer,
    ModernResumeRenderer,
    ExecutiveResumeRenderer,
    ResumesPdfService,
    ResumeTailoringService,
    OpenAiService,
    ResumesService,
  ],
  controllers: [ResumesController],
})
export class ResumesModule {}
