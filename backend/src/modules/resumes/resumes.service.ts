import path from 'path';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UserRepository } from '../users/users.repository';
import { JobAdvertisementRepository } from '../job-ads/job-advertisement.repository';
import { UserEducationRepository } from '../users/user-education.repository';
import { UserWorkExperienceRepository } from '../users/user-work-experience.repository';
import { UserSkillRepository } from '../users/user-skill.repository';
import { UserProjectRepository } from '../users/user-project.repository';
import { AtsScoreRepository } from '../ats/ats-score.repository';
import { ATS_SCORE_THRESHOLD } from '../ats/ats.service';
import { ResumeTemplateRepository } from './resume-template.repository';
import { GeneratedResumeRepository } from './generated-resume.repository';
import { ResumesPdfService } from './resumes-pdf.service';
import { ResumeTailoringService } from './resume-tailoring.service';
import type { JobAdvertisement } from '../job-ads/job-advertisement.model';
import type { User } from '../users/user.model';
import type { UserEducation } from '../users/user-education.model';
import type { UserProject } from '../users/user-project.model';
import type { UserSkill } from '../users/user-skill.model';
import type { UserWorkExperience } from '../users/user-work-experience.model';
import type { ResumeTemplate } from './resume-template.model';
import type { TailoredResumeContent } from './resume-render.types';

@Injectable()
export class ResumesService {
  private static readonly RESUMES_SUBDIR = 'resumes';

  constructor(
    private readonly resumeTemplateRepository: ResumeTemplateRepository,
    private readonly generatedResumeRepository: GeneratedResumeRepository,
    private readonly userRepository: UserRepository,
    private readonly jobAdRepository: JobAdvertisementRepository,
    private readonly educationRepository: UserEducationRepository,
    private readonly workExperienceRepository: UserWorkExperienceRepository,
    private readonly skillRepository: UserSkillRepository,
    private readonly projectRepository: UserProjectRepository,
    private readonly atsScoreRepository: AtsScoreRepository,
    private readonly resumesPdfService: ResumesPdfService,
    private readonly resumeTailoringService: ResumeTailoringService,
  ) {}

  async listTemplates(language?: string) {
    if (language) {
      return this.resumeTemplateRepository.findActiveByLanguage(language);
    }
    const templates = await Promise.all([
      this.resumeTemplateRepository.findActiveByLanguage('en'),
      this.resumeTemplateRepository.findActiveByLanguage('hi'),
    ]);
    return templates.flat();
  }

  async list(userId: string, jobAdId?: string) {
    const resumes = await this.generatedResumeRepository.findAllByUserId(
      userId,
      jobAdId,
    );
    return resumes.map((r) => ({
      id: r.id,
      jobAdId: r.jobAdId,
      resumeTemplateId: r.resumeTemplateId,
      jobAdvertisement: r.jobAdvertisement,
      resumeTemplate: r.resumeTemplate,
      filename: r.filename,
      atsScore: Number(r.atsScore),
      generatedAt: r.generatedAt,
    }));
  }

  async generate(
    userId: string,
    jobAdId: string,
    resumeTemplateId: string,
    language?: string,
  ) {
    const jobAd = await this.jobAdRepository.findByIdAndUserId(jobAdId, userId);
    if (!jobAd) {
      throw new NotFoundException('Job advertisement not found');
    }

    const template = await this.resumeTemplateRepository.findById(
      resumeTemplateId,
      true,
    );

    if (!template || !template.isActive) {
      throw new NotFoundException('Resume template not found or inactive');
    }

    const atsScore = await this.atsScoreRepository.findByUserAndJobAd(
      userId,
      jobAdId,
    );
    if (!atsScore || Number(atsScore.atsScore) < ATS_SCORE_THRESHOLD) {
      throw new ForbiddenException(
        `ATS score must be at least ${ATS_SCORE_THRESHOLD} to generate a resume`,
      );
    }

    const [user, educations, workExperiences, skills, projects] =
      await Promise.all([
        this.userRepository.findById(userId),
        this.educationRepository.findAllByUserId(userId),
        this.workExperienceRepository.findAllByUserId(userId),
        this.skillRepository.findAllByUserId(userId),
        this.projectRepository.findAllByUserId(userId),
      ]);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const filename = this.buildFilename(jobAd, template);
    const selectedLanguage = language ?? template.language;
    const tailoredContent = await this.resumeTailoringService.tailor({
      user,
      jobAd,
      educations,
      workExperiences,
      skills,
      projects,
      language: selectedLanguage,
    });
    const { relativePath } = await this.buildPdf(
      user,
      jobAd,
      educations,
      workExperiences,
      skills,
      projects,
      tailoredContent,
      template,
      Number(atsScore.atsScore),
      selectedLanguage,
    );

    const resume = await this.generatedResumeRepository.create({
      userId,
      jobAdId,
      resumeTemplateId,
      atsScore: atsScore.atsScore,
      filePath: relativePath,
      filename,
      tailoredContent,
      generatedAt: new Date(),
    });

    return {
      previewId: resume.id,
      filename: resume.filename,
      atsScore: Number(resume.atsScore),
      generatedAt: resume.generatedAt,
    };
  }

  async preview(id: string, userId: string) {
    const resume = await this.generatedResumeRepository.findById(id);

    if (!resume || resume.userId !== userId) {
      throw new NotFoundException('Generated resume not found');
    }

    const absolutePath = this.resolveFilePath(resume.filePath);
    const fs = await import('fs');
    if (!fs.existsSync(absolutePath)) {
      throw new NotFoundException('Resume file not found on disk');
    }

    return {
      previewId: resume.id,
      filename: resume.filename || `resume-${resume.id}.pdf`,
      atsScore: Number(resume.atsScore),
      generatedAt: resume.generatedAt,
    };
  }

  async getFilePath(id: string, userId: string): Promise<string> {
    const resume = await this.generatedResumeRepository.findById(id);

    if (!resume || resume.userId !== userId) {
      throw new NotFoundException('Generated resume not found d');
    }
    return this.resolveFilePath(resume.filePath);
  }

  private resolveFilePath(relativePath: string): string {
    return path.join(process.env.STORAGE_LOCATION!, relativePath);
  }

  private buildFilename(
    jobAd: JobAdvertisement,
    template: ResumeTemplate,
  ): string {
    const slug = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
    return `${slug(template.name)}_Resume_${slug(jobAd.title)}.pdf`;
  }

  private async buildPdf(
    user: User,
    jobAd: JobAdvertisement,
    educations: UserEducation[],
    workExperiences: UserWorkExperience[],
    skills: UserSkill[],
    projects: UserProject[],
    tailoredContent: TailoredResumeContent,
    template: ResumeTemplate,
    atsScore: number,
    language: string,
  ): Promise<{ relativePath: string }> {
    const fs = await import('fs/promises');
    const dir = path.join(
      process.env.STORAGE_LOCATION!,
      ResumesService.RESUMES_SUBDIR,
    );
    await fs.mkdir(dir, { recursive: true });

    const fileName = `resume-${user.userId}-${Date.now()}.pdf`;
    const relativePath = path.join(ResumesService.RESUMES_SUBDIR, fileName);
    const absolutePath = path.join(process.env.STORAGE_LOCATION!, relativePath);

    const pdfBuffer = await this.resumesPdfService.render({
      user,
      jobAd,
      educations,
      workExperiences,
      skills,
      projects,
      tailoredContent,
      template,
      atsScore,
      language,
    });

    await fs.writeFile(absolutePath, pdfBuffer);
    return { relativePath };
  }
}
