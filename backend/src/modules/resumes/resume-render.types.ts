import type { ReactElement } from 'react';
import type { JobAdvertisement } from '../job-ads/job-advertisement.model';
import type { User } from '../users/user.model';
import type { UserEducation } from '../users/user-education.model';
import type { UserProject } from '../users/user-project.model';
import type { UserSkill } from '../users/user-skill.model';
import type { UserWorkExperience } from '../users/user-work-experience.model';
import type { ResumeTemplate } from './resume-template.model';

export type ResumeRenderData = {
  user: User;
  jobAd: JobAdvertisement;
  educations: UserEducation[];
  workExperiences: UserWorkExperience[];
  skills: UserSkill[];
  projects: UserProject[];
  template: ResumeTemplate;
  atsScore: number;
};

export interface ResumeTemplateRenderer {
  supports(template: ResumeTemplate): boolean;
  render(data: ResumeRenderData): Promise<Buffer>;
}

export type ResumeTemplateDocumentFactory = (
  data: ResumeRenderData,
) => ReactElement;
