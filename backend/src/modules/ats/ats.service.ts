import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AtsScoreRepository } from './ats-score.repository';
import { UserRepository } from '../users/users.repository';
import { JobAdvertisementRepository } from '../job-ads/job-advertisement.repository';
import { UserEducationRepository } from '../users/user-education.repository';
import { UserWorkExperienceRepository } from '../users/user-work-experience.repository';
import { UserSkillRepository } from '../users/user-skill.repository';
import { UserProjectRepository } from '../users/user-project.repository';

@Injectable()
export class AtsService {
  constructor(
    private readonly atsScoreRepository: AtsScoreRepository,
    private readonly userRepository: UserRepository,
    private readonly jobAdRepository: JobAdvertisementRepository,
    private readonly educationRepository: UserEducationRepository,
    private readonly workExperienceRepository: UserWorkExperienceRepository,
    private readonly skillRepository: UserSkillRepository,
    private readonly projectRepository: UserProjectRepository,
  ) {}

  async compute(userId: string, jobAdId: string) {
    const jobAd = await this.jobAdRepository.findByIdAndUserId(jobAdId, userId);
    if (!jobAd) {
      throw new NotFoundException('Job advertisement not found');
    }

    const [educations, workExperiences, skills, projects] = await Promise.all([
      this.educationRepository.findAllByUserId(userId),
      this.workExperienceRepository.findAllByUserId(userId),
      this.skillRepository.findAllByUserId(userId),
      this.projectRepository.findAllByUserId(userId),
    ]);

    const { score, recommendations } = this.calculateScore(
      jobAd,
      educations,
      workExperiences,
      skills,
      projects,
    );

    const saved = await this.atsScoreRepository.upsert(userId, jobAdId, {
      atsScore: score,
      recommendations,
    });

    return {
      userId,
      jobAdId,
      atsScore: Number(saved.atsScore),
      recommendations: saved.recommendations,
      computedAt: saved.updatedAt,
    };
  }

  async findByUserAndJobAd(userId: string, jobAdId: string) {
    const score = await this.atsScoreRepository.findByUserAndJobAd(
      userId,
      jobAdId,
    );
    if (!score) {
      throw new NotFoundException('ATS score not found for this job advertisement');
    }
    return {
      userId: score.userId,
      jobAdId: score.jobAdId,
      atsScore: Number(score.atsScore),
      recommendations: score.recommendations,
      computedAt: score.updatedAt,
    };
  }

  private calculateScore(
    jobAd: { title: string; description: string; requirements: string },
    educations: Array<{ institution: string; degree: string | null; fieldOfStudy: string | null }>,
    workExperiences: Array<{ company: string; role: string; description: string | null }>,
    skills: Array<{ skillName: string; proficiencyLevel: string | null }>,
    projects: Array<{ projectName: string; description: string | null; techStack: string | null }>,
  ) {
    const recommendations: Array<{ type: string; message: string }> = [];
    let totalScore = 0;

    const jobText = `${jobAd.title} ${jobAd.description} ${jobAd.requirements}`.toLowerCase();

    const skillScore = this.scoreSkills(jobText, skills, recommendations);
    totalScore += skillScore;

    const experienceScore = this.scoreExperience(jobText, workExperiences, recommendations);
    totalScore += experienceScore;

    const educationScore = this.scoreEducation(jobText, educations, recommendations);
    totalScore += educationScore;

    const projectScore = this.scoreProjects(jobText, projects, recommendations);
    totalScore += projectScore;

    const score = Math.min(Math.round(totalScore), 100);

    return { score, recommendations };
  }

  private scoreSkills(
    jobText: string,
    skills: Array<{ skillName: string }>,
    recommendations: Array<{ type: string; message: string }>,
  ): number {
    if (skills.length === 0) {
      recommendations.push({
        type: 'skill',
        message: 'Add skills to your profile to improve your ATS score.',
      });
      return 0;
    }

    const matchedSkills = skills.filter((s) =>
      jobText.includes(s.skillName.toLowerCase()),
    );
    const ratio = matchedSkills.length / Math.max(skills.length, 1);
    const score = ratio * 35;

    if (matchedSkills.length === 0) {
      recommendations.push({
        type: 'skill',
        message: 'None of your listed skills match the job requirements. Consider adding relevant skills.',
      });
    } else if (ratio < 0.5) {
      recommendations.push({
        type: 'skill',
        message: `Only ${matchedSkills.length} of your ${skills.length} skills match the job. Consider adding more relevant skills.`,
      });
    }

    return score;
  }

  private scoreExperience(
    jobText: string,
    workExperiences: Array<{ role: string; description: string | null }>,
    recommendations: Array<{ type: string; message: string }>,
  ): number {
    if (workExperiences.length === 0) {
      recommendations.push({
        type: 'project',
        message: 'Add work experience entries to strengthen your profile.',
      });
      return 0;
    }

    const matchedRoles = workExperiences.filter((w) =>
      jobText.includes(w.role.toLowerCase()),
    );
    const ratio = matchedRoles.length / Math.max(workExperiences.length, 1);
    const score = ratio * 30;

    if (matchedRoles.length === 0) {
      recommendations.push({
        type: 'skill',
        message: 'None of your work experience roles match the job title. Consider updating your roles.',
      });
    }

    return score;
  }

  private scoreEducation(
    jobText: string,
    educations: Array<{ degree: string | null; fieldOfStudy: string | null }>,
    recommendations: Array<{ type: string; message: string }>,
  ): number {
    if (educations.length === 0) {
      recommendations.push({
        type: 'project',
        message: 'Add education entries to complete your profile.',
      });
      return 0;
    }

    const hasRelevantEducation = educations.some((e) => {
      const text = `${e.degree ?? ''} ${e.fieldOfStudy ?? ''}`.toLowerCase();
      return text.length > 0 && jobText.includes(text);
    });

    return hasRelevantEducation ? 20 : 10;
  }

  private scoreProjects(
    jobText: string,
    projects: Array<{ description: string | null; techStack: string | null }>,
    recommendations: Array<{ type: string; message: string }>,
  ): number {
    if (projects.length === 0) {
      recommendations.push({
        type: 'project',
        message: 'Add project entries to showcase relevant work.',
      });
      return 0;
    }

    const matchedProjects = projects.filter((p) => {
      const text = `${p.description ?? ''} ${p.techStack ?? ''}`.toLowerCase();
      return text.length > 0 && jobText.includes(text);
    });
    const ratio = matchedProjects.length / Math.max(projects.length, 1);

    return ratio * 15;
  }
}
