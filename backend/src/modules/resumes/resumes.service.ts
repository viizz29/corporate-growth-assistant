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
import { ResumeTemplateRepository } from './resume-template.repository';
import { GeneratedResumeRepository } from './generated-resume.repository';
import { ResumesPdfService } from './resumes-pdf.service';
import type { JobAdvertisement } from '../job-ads/job-advertisement.model';
import type { User } from '../users/user.model';
import type { UserEducation } from '../users/user-education.model';
import type { UserProject } from '../users/user-project.model';
import type { UserSkill } from '../users/user-skill.model';
import type { UserWorkExperience } from '../users/user-work-experience.model';
import type { ResumeTemplate } from './resume-template.model';

@Injectable()
export class ResumesService {
  private static readonly ATS_THRESHOLD = 40;

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

  async generate(userId: string, jobAdId: string, resumeTemplateId: string) {
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
    if (!atsScore || Number(atsScore.atsScore) < ResumesService.ATS_THRESHOLD) {
      throw new ForbiddenException(
        `ATS score must be at least ${ResumesService.ATS_THRESHOLD} to generate a resume`,
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

    const filePath = await this.buildPdf(
      user,
      jobAd,
      educations,
      workExperiences,
      skills,
      projects,
      template,
      Number(atsScore.atsScore),
    );

    const resume = await this.generatedResumeRepository.create({
      userId,
      jobAdId,
      resumeTemplateId,
      atsScore: atsScore.atsScore,
      filePath,
      generatedAt: new Date(),
    });

    return {
      previewId: resume.id,
      filePath: resume.filePath,
      atsScore: Number(resume.atsScore),
      generatedAt: resume.generatedAt,
    };
  }

  async preview(id: string, userId: string) {
    const resume = await this.generatedResumeRepository.findById(id);
    if (!resume || resume.userId !== userId) {
      throw new NotFoundException('Generated resume not found');
    }

    const fs = await import('fs');
    if (!fs.existsSync(resume.filePath)) {
      throw new NotFoundException('Resume file not found on disk');
    }

    return {
      previewId: resume.id,
      fileName: resume.filePath.split('/').pop(),
      atsScore: Number(resume.atsScore),
      generatedAt: resume.generatedAt,
    };
  }

  async getFilePath(id: string, userId: string): Promise<string> {
    const resume = await this.generatedResumeRepository.findById(id);
    if (!resume || resume.userId !== userId) {
      throw new NotFoundException('Generated resume not found');
    }
    return resume.filePath;
  }

  private async buildPdf(
    user: User,
    jobAd: JobAdvertisement,
    educations: UserEducation[],
    workExperiences: UserWorkExperience[],
    skills: UserSkill[],
    projects: UserProject[],
    template: ResumeTemplate,
    atsScore: number,
  ): Promise<string> {
    const dir = `./assets/resumes`;
    const fs = await import('fs/promises');
    await fs.mkdir(dir, { recursive: true });
    const fileName = `resume-${user.userId}-${Date.now()}.pdf`;
    const filePath = `${dir}/${fileName}`;

    const pdfBuffer = await this.resumesPdfService.render({
      user,
      jobAd,
      educations,
      workExperiences,
      skills,
      projects,
      template,
      atsScore,
    });

    await fs.writeFile(filePath, pdfBuffer);
    return filePath;
  }
}
