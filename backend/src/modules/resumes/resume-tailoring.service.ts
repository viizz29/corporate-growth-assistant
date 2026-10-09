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
    jobAd: JobAdvertisement | null;
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
        jobAd: input.jobAd
          ? {
              title: input.jobAd.title,
              description: input.jobAd.description,
              requirements: input.jobAd.requirements,
              location: input.jobAd.location,
            }
          : null,
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
      jobAd: JobAdvertisement | null;
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

    const generalPurpose = !input.jobAd;

    const selectedSkills = generalPurpose
      ? input.skills.map((skill) => ({
          id: skill.id,
          skillName: skill.skillName,
          proficiencyLevel: skill.proficiencyLevel,
        }))
      : this.selectSkills(input.skills, skillMap, aiResult);
    const selectedWorkExperiences = generalPurpose
      ? input.workExperiences.map((experience) => ({
          id: experience.id,
          company: experience.company,
          role: experience.role,
          startDate: experience.startDate,
          endDate: experience.endDate,
          description: experience.description,
          relevanceReason: '',
        }))
      : this.selectWorkExperiences(input.workExperiences, workMap, aiResult);
    const selectedProjects = generalPurpose
      ? input.projects.map((project) => ({
          id: project.id,
          projectName: project.projectName,
          description: project.description,
          startDate: project.startDate,
          endDate: project.endDate,
          techStack: project.techStack,
          relevanceReason: '',
        }))
      : this.selectProjects(input.projects, projectMap, aiResult);
    const selectedEducations = generalPurpose
      ? input.educations.map((education) => ({
          id: education.id,
          institution: education.institution,
          degree: education.degree,
          fieldOfStudy: education.fieldOfStudy,
          startDate: education.startDate,
          endDate: education.endDate,
          description: education.description,
        }))
      : this.selectEducations(input.educations, educationMap, aiResult);

    return {
      headline:
        aiResult?.headline?.trim() ||
        this.buildFallbackHeadline(
          input.workExperiences,
          input.jobAd?.title ?? null,
        ),
      profileSummary:
        aiResult?.profileSummary?.trim() ||
        this.buildFallbackSummary(
          input.user.name,
          input.jobAd?.title ?? null,
          selectedWorkExperiences,
          selectedSkills,
        ),
      skills: selectedSkills,
      workExperiences: selectedWorkExperiences,
      projects: selectedProjects,
      educations: selectedEducations,
      omittedItemIds: generalPurpose
        ? {
            skillIds: [],
            workExperienceIds: [],
            projectIds: [],
            educationIds: [],
          }
        : {
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
    jobTitle: string | null,
  ): string {
    const latestRole = workExperiences[0]?.role?.trim();
    return latestRole || jobTitle || 'Professional';
  }

  private buildFallbackSummary(
    userName: string,
    jobTitle: string | null,
    workExperiences: TailoredResumeWorkExperience[],
    skills: TailoredResumeSkill[],
  ): string {
    const latestRole = workExperiences[0]?.role;
    const leadingSkills = skills.slice(0, 3).map((skill) => skill.skillName);

    const intro = jobTitle
      ? `${userName} is targeting the ${jobTitle} role with a resume focused on the most relevant experience and strengths.`
      : `${userName} presents a general purpose resume highlighting their overall experience and strengths.`;

    return [
      intro,
      latestRole ? `Recent experience includes ${latestRole}.` : null,
      leadingSkills.length
        ? `Key areas of fit include ${leadingSkills.join(', ')}.`
        : null,
    ]
      .filter(Boolean)
      .join(' ');
  }
}
