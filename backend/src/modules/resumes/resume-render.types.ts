import type { ReactElement } from 'react';
import type { JobAdvertisement } from '../job-ads/job-advertisement.model';
import type { User } from '../users/user.model';
import type { UserEducation } from '../users/user-education.model';
import type { UserProject } from '../users/user-project.model';
import type { UserSkill } from '../users/user-skill.model';
import type { UserWorkExperience } from '../users/user-work-experience.model';
import type { ResumeTemplate } from './resume-template.model';

export type TailoredResumeSkill = {
  id: string;
  skillName: string;
  proficiencyLevel: string | null;
};

export type TailoredResumeWorkExperience = {
  id: string;
  company: string;
  role: string;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  relevanceReason: string;
};

export type TailoredResumeProject = {
  id: string;
  projectName: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  techStack: string | null;
  relevanceReason: string;
};

export type TailoredResumeEducation = {
  id: string;
  institution: string;
  degree: string | null;
  fieldOfStudy: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
};

export type TailoredResumeContent = {
  headline: string;
  profileSummary: string;
  skills: TailoredResumeSkill[];
  workExperiences: TailoredResumeWorkExperience[];
  projects: TailoredResumeProject[];
  educations: TailoredResumeEducation[];
  omittedItemIds: {
    skillIds: string[];
    workExperienceIds: string[];
    projectIds: string[];
    educationIds: string[];
  };
  rawResponse?: string;
};

export type ResumeRenderData = {
  user: User;
  jobAd: JobAdvertisement;
  educations: UserEducation[];
  workExperiences: UserWorkExperience[];
  skills: UserSkill[];
  projects: UserProject[];
  tailoredContent: TailoredResumeContent;
  template: ResumeTemplate;
  atsScore: number;
  language: string;
};

export interface ResumeTemplateRenderer {
  supports(template: ResumeTemplate): boolean;
  render(data: ResumeRenderData): Promise<Buffer>;
}

export type ResumeTemplateDocumentFactory = (
  data: ResumeRenderData,
) => ReactElement;
