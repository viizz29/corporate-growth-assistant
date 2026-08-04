import { Injectable } from '@nestjs/common';
import {
  OpenAiService,
  ResumeTailoringAiResult,
} from '../../lib/openai.service';
import type { JobAdvertisement } from '../job-ads/job-advertisement.model';
import type { User } from '../users/user.model';
import type { UserEducation } from '../users/user-education.model';
import type { UserProject } from '../users/user-project.model';
import type { UserSkill } from '../users/user-skill.model';
import type { UserWorkExperience } from '../users/user-work-experience.model';
import type {
  TailoredResumeContent,
  TailoredResumeEducation,
  TailoredResumeProject,
  TailoredResumeSkill,
  TailoredResumeWorkExperience,
} from './resume-render.types';

@Injectable()
export class ResumeTailoringService {
  constructor(private readonly openAiService: OpenAiService) {}

  async tailor(input: {
    user: User;
    jobAd: JobAdvertisement;
    educations: UserEducation[];
    workExperiences: UserWorkExperience[];
    skills: UserSkill[];
    projects: UserProject[];
    language: string;
  }): Promise<TailoredResumeContent> {
    let aiResult: ResumeTailoringAiResult | null = null;

    try {
      aiResult = await this.openAiService.generateTailoredResumeContent({
        language: input.language,
        jobAd: {
          title: input.jobAd.title,
          description: input.jobAd.description,
          requirements: input.jobAd.requirements,
          location: input.jobAd.location,
        },
        user: {
          name: input.user.name,
          email: input.user.email,
        },
        educations: input.educations.map((education) => ({
          id: education.id,
          institution: education.institution,
          degree: education.degree,
          fieldOfStudy: education.fieldOfStudy,
          startDate: education.startDate,
          endDate: education.endDate,
          description: education.description,
        })),
        workExperiences: input.workExperiences.map((experience) => ({
          id: experience.id,
          company: experience.company,
          role: experience.role,
          startDate: experience.startDate,
          endDate: experience.endDate,
          description: experience.description,
        })),
        skills: input.skills.map((skill) => ({
          id: skill.id,
          skillName: skill.skillName,
          proficiencyLevel: skill.proficiencyLevel,
        })),
        projects: input.projects.map((project) => ({
          id: project.id,
          projectName: project.projectName,
          description: project.description,
          startDate: project.startDate,
          endDate: project.endDate,
          techStack: project.techStack,
        })),
      });
    } catch (error) {
      // Preserve resume generation even if AI tailoring is unavailable.
      console.warn('Resume tailoring failed:', error);
    }

    return this.buildTailoredContent(input, aiResult);
  }

  private buildTailoredContent(
    input: {
      user: User;
      jobAd: JobAdvertisement;
      educations: UserEducation[];
      workExperiences: UserWorkExperience[];
      skills: UserSkill[];
      projects: UserProject[];
      language: string;
    },
    aiResult: ResumeTailoringAiResult | null,
  ): TailoredResumeContent {
    const skillMap = new Map(input.skills.map((skill) => [skill.id, skill]));
    const workMap = new Map(
      input.workExperiences.map((experience) => [experience.id, experience]),
    );
    const projectMap = new Map(
      input.projects.map((project) => [project.id, project]),
    );
    const educationMap = new Map(
      input.educations.map((education) => [education.id, education]),
    );

    const selectedSkills = this.selectSkills(input.skills, skillMap, aiResult);
    const selectedWorkExperiences = this.selectWorkExperiences(
      input.workExperiences,
      workMap,
      aiResult,
    );
    const selectedProjects = this.selectProjects(
      input.projects,
      projectMap,
      aiResult,
    );
    const selectedEducations = this.selectEducations(
      input.educations,
      educationMap,
      aiResult,
    );

    return {
      headline:
        aiResult?.headline?.trim() ||
        this.buildFallbackHeadline(input.workExperiences, input.jobAd.title),
      profileSummary:
        aiResult?.profileSummary?.trim() ||
        this.buildFallbackSummary(
          input.user.name,
          input.jobAd.title,
          selectedWorkExperiences,
          selectedSkills,
        ),
      skills: selectedSkills,
      workExperiences: selectedWorkExperiences,
      projects: selectedProjects,
      educations: selectedEducations,
      omittedItemIds: {
        skillIds: this.buildOmittedIds(
          input.skills.map((skill) => skill.id),
          selectedSkills.map((skill) => skill.id),
          aiResult?.omittedItemIds.skillIds,
        ),
        workExperienceIds: this.buildOmittedIds(
          input.workExperiences.map((experience) => experience.id),
          selectedWorkExperiences.map((experience) => experience.id),
          aiResult?.omittedItemIds.workExperienceIds,
        ),
        projectIds: this.buildOmittedIds(
          input.projects.map((project) => project.id),
          selectedProjects.map((project) => project.id),
          aiResult?.omittedItemIds.projectIds,
        ),
        educationIds: this.buildOmittedIds(
          input.educations.map((education) => education.id),
          selectedEducations.map((education) => education.id),
          aiResult?.omittedItemIds.educationIds,
        ),
      },
      rawResponse: aiResult?.rawResponse,
    };
  }

  private selectSkills(
    skills: UserSkill[],
    skillMap: Map<string, UserSkill>,
    aiResult: ResumeTailoringAiResult | null,
  ): TailoredResumeSkill[] {
    const aiSelections =
      aiResult?.selectedSkillIds
        .map((id) => skillMap.get(id))
        .filter((skill): skill is UserSkill => !!skill) ?? [];

    const source = aiSelections.length > 0 ? aiSelections : skills;
    return source.map((skill) => ({
      id: skill.id,
      skillName: skill.skillName,
      proficiencyLevel: skill.proficiencyLevel,
    }));
  }

  private selectWorkExperiences(
    workExperiences: UserWorkExperience[],
    workMap: Map<string, UserWorkExperience>,
    aiResult: ResumeTailoringAiResult | null,
  ): TailoredResumeWorkExperience[] {
    const aiSelections =
      aiResult?.selectedWorkExperiences
        .map((item) => {
          const experience = workMap.get(item.id);
          if (!experience) {
            return null;
          }

          return {
            id: experience.id,
            company: experience.company,
            role: experience.role,
            startDate: experience.startDate,
            endDate: experience.endDate,
            description:
              item.rewrittenDescription ?? experience.description ?? null,
            relevanceReason: item.relevanceReason.trim(),
          };
        })
        .filter(
          (
            experience,
          ): experience is TailoredResumeWorkExperience => !!experience,
        ) ?? [];

    if (aiSelections.length > 0) {
      return aiSelections;
    }

    return workExperiences.map((experience) => ({
      id: experience.id,
      company: experience.company,
      role: experience.role,
      startDate: experience.startDate,
      endDate: experience.endDate,
      description: experience.description,
      relevanceReason: '',
    }));
  }

  private selectProjects(
    projects: UserProject[],
    projectMap: Map<string, UserProject>,
    aiResult: ResumeTailoringAiResult | null,
  ): TailoredResumeProject[] {
    const aiSelections =
      aiResult?.selectedProjects
        .map((item) => {
          const project = projectMap.get(item.id);
          if (!project) {
            return null;
          }

          return {
            id: project.id,
            projectName: project.projectName,
            description: item.rewrittenDescription ?? project.description ?? null,
            startDate: project.startDate,
            endDate: project.endDate,
            techStack: project.techStack,
            relevanceReason: item.relevanceReason.trim(),
          };
        })
        .filter((project): project is TailoredResumeProject => !!project) ?? [];

    if (aiSelections.length > 0) {
      return aiSelections;
    }

    return projects.map((project) => ({
      id: project.id,
      projectName: project.projectName,
      description: project.description,
      startDate: project.startDate,
      endDate: project.endDate,
      techStack: project.techStack,
      relevanceReason: '',
    }));
  }

  private selectEducations(
    educations: UserEducation[],
    educationMap: Map<string, UserEducation>,
    aiResult: ResumeTailoringAiResult | null,
  ): TailoredResumeEducation[] {
    const aiSelections =
      aiResult?.selectedEducationIds
        .map((id) => educationMap.get(id))
        .filter((education): education is UserEducation => !!education) ?? [];

    const source = aiSelections.length > 0 ? aiSelections : educations;
    return source.map((education) => ({
      id: education.id,
      institution: education.institution,
      degree: education.degree,
      fieldOfStudy: education.fieldOfStudy,
      startDate: education.startDate,
      endDate: education.endDate,
      description: education.description,
    }));
  }

  private buildOmittedIds(
    allIds: string[],
    selectedIds: string[],
    aiOmittedIds?: string[],
  ): string[] {
    const selected = new Set(selectedIds);
    const fallbackOmitted = allIds.filter((id) => !selected.has(id));
    if (!aiOmittedIds?.length) {
      return fallbackOmitted;
    }

    const allowed = new Set(allIds);
    return Array.from(
      new Set(
        aiOmittedIds.filter((id) => allowed.has(id)).concat(fallbackOmitted),
      ),
    );
  }

  private buildFallbackHeadline(
    workExperiences: UserWorkExperience[],
    jobTitle: string,
  ): string {
    const latestRole = workExperiences[0]?.role?.trim();
    return latestRole || jobTitle;
  }

  private buildFallbackSummary(
    userName: string,
    jobTitle: string,
    workExperiences: TailoredResumeWorkExperience[],
    skills: TailoredResumeSkill[],
  ): string {
    const latestRole = workExperiences[0]?.role;
    const leadingSkills = skills.slice(0, 3).map((skill) => skill.skillName);

    return [
      `${userName} is targeting the ${jobTitle} role with a resume focused on the most relevant experience and strengths.`,
      latestRole ? `Recent experience includes ${latestRole}.` : null,
      leadingSkills.length
        ? `Key areas of fit include ${leadingSkills.join(', ')}.`
        : null,
    ]
      .filter(Boolean)
      .join(' ');
  }
}
