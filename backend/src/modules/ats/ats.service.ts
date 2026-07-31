import { Injectable, NotFoundException } from '@nestjs/common';
import { AtsScoreRepository } from './ats-score.repository';
import { UserRepository } from '../users/users.repository';
import { JobAdvertisementRepository } from '../job-ads/job-advertisement.repository';
import { UserEducationRepository } from '../users/user-education.repository';
import { UserWorkExperienceRepository } from '../users/user-work-experience.repository';
import { UserSkillRepository } from '../users/user-skill.repository';
import { UserProjectRepository } from '../users/user-project.repository';
import { OpenAiService, AtsAiFeedback } from '../../lib/openai.service';

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
    private readonly openAiService: OpenAiService,
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

    let aiFeedback: AtsAiFeedback | null = null;
    try {
      aiFeedback = await this.openAiService.generateAtsFeedback({
        jobAd,
        educations,
        workExperiences,
        skills,
        projects,
        localScore: score,
      });
    } catch (error) {
      // Preserve local score and recommendations if AI integration fails
      console.warn('AI feedback generation failed:', error);
    }

    const saved = await this.atsScoreRepository.upsert(userId, jobAdId, {
      atsScore: score,
      recommendations,
      aiFeedback,
    });

    return {
      userId,
      jobAdId,
      atsScore: Number(saved.atsScore),
      recommendations: saved.recommendations,
      aiFeedback: saved.aiFeedback ?? null,
      computedAt: saved.updatedAt,
    };
  }

  async findByUserAndJobAd(userId: string, jobAdId: string) {
    const score = await this.atsScoreRepository.findByUserAndJobAd(
      userId,
      jobAdId,
    );
    if (!score) {
      throw new NotFoundException(
        'ATS score not found for this job advertisement',
      );
    }

    console.log(score);

    return {
      userId: score.userId,
      jobAdId: score.jobAdId,
      atsScore: Number(score.atsScore),
      recommendations: score.recommendations,
      aiFeedback: score.aiFeedback || null,
      computedAt: score.updatedAt,
    };
  }

  private calculateScore(
    jobAd: { title: string; description: string; requirements: string },
    educations: Array<{
      institution: string;
      degree: string | null;
      fieldOfStudy: string | null;
    }>,
    workExperiences: Array<{
      company: string;
      role: string;
      description: string | null;
    }>,
    skills: Array<{ skillName: string; proficiencyLevel: string | null }>,
    projects: Array<{
      projectName: string;
      description: string | null;
      techStack: string | null;
    }>,
  ) {
    const recommendations: Array<{ type: string; message: string }> = [];

    const jobContext = this.buildJobContext(jobAd);
    const candidateContext = this.buildCandidateContext(
      skills,
      workExperiences,
      projects,
      educations,
    );

    const skillScore = this.scoreSkills(
      jobContext,
      candidateContext,
      recommendations,
    );
    const experienceScore = this.scoreExperience(
      jobContext,
      workExperiences,
      recommendations,
    );
    const educationScore = this.scoreEducation(
      jobContext,
      educations,
      recommendations,
    );
    const projectScore = this.scoreProjects(
      jobContext,
      projects,
      recommendations,
    );

    const score = Math.min(
      Math.round(skillScore + experienceScore + educationScore + projectScore),
      100,
    );

    return { score, recommendations };
  }

  private scoreSkills(
    jobContext: {
      requiredSkills: Set<string>;
      preferredSkills: Set<string>;
      broadSkills: Set<string>;
      fullText: string;
    },
    candidateContext: { skillTerms: Set<string> },
    recommendations: Array<{ type: string; message: string }>,
  ): number {
    if (candidateContext.skillTerms.size === 0) {
      recommendations.push({
        type: 'skill',
        message: 'Add skills to your profile to improve your ATS score.',
      });
      return 0;
    }

    const requiredMatches = this.intersectSets(
      jobContext.requiredSkills,
      candidateContext.skillTerms,
    );
    const preferredMatches = this.intersectSets(
      jobContext.preferredSkills,
      candidateContext.skillTerms,
    );
    const broadMatches = this.intersectSets(
      jobContext.broadSkills,
      candidateContext.skillTerms,
    );

    const requiredScore = jobContext.requiredSkills.size
      ? (requiredMatches.size / jobContext.requiredSkills.size) * 25
      : 0;
    const preferredScore = jobContext.preferredSkills.size
      ? (preferredMatches.size / jobContext.preferredSkills.size) * 10
      : 0;
    const broadScore = jobContext.broadSkills.size
      ? (broadMatches.size / jobContext.broadSkills.size) * 10
      : 0;

    const score = requiredScore + preferredScore + broadScore;

    if (jobContext.requiredSkills.size > 0 && requiredMatches.size === 0) {
      const missing = Array.from(jobContext.requiredSkills).slice(0, 5);
      recommendations.push({
        type: 'skill',
        message: `The job requires ${missing.join(', ')}. Add those skills to improve relevance.`,
      });
    } else if (
      jobContext.preferredSkills.size > 0 &&
      preferredMatches.size === 0 &&
      score < 20
    ) {
      recommendations.push({
        type: 'skill',
        message:
          'Add some preferred or related skills from the job description to improve your score.',
      });
    } else if (
      broadMatches.size / Math.max(jobContext.broadSkills.size, 1) <
      0.3
    ) {
      recommendations.push({
        type: 'skill',
        message:
          'Include more domain-specific skills that align with the job description, rather than generic or unrelated skills.',
      });
    }

    return Math.min(Math.round(score), 45);
  }

  private scoreExperience(
    jobContext: {
      broadSkills: Set<string>;
      fullText: string;
    },
    workExperiences: Array<{ role: string; description: string | null }>,
    recommendations: Array<{ type: string; message: string }>,
  ): number {
    if (workExperiences.length === 0) {
      recommendations.push({
        type: 'experience',
        message: 'Add work experience entries to strengthen your profile.',
      });
      return 0;
    }

    let totalRelevance = 0;
    let relevantExperienceCount = 0;

    for (const experience of workExperiences) {
      const roleTokens = this.extractSkillTerms(experience.role);
      const descriptionTokens = this.extractSkillTerms(
        experience.description || '',
      );
      const titleMatches = this.intersectSets(
        jobContext.broadSkills,
        roleTokens,
      );
      const descriptionMatches = this.intersectSets(
        jobContext.broadSkills,
        descriptionTokens,
      );

      const itemRelevance =
        Math.min(titleMatches.size * 10, 18) +
        Math.min(descriptionMatches.size * 4, 12);
      if (itemRelevance > 0) {
        relevantExperienceCount += 1;
      }
      totalRelevance += itemRelevance;
    }

    const averageRelevance = totalRelevance / workExperiences.length;
    const score = Math.min(Math.round(averageRelevance), 30);

    if (relevantExperienceCount === 0) {
      recommendations.push({
        type: 'experience',
        message:
          'Your experience descriptions do not clearly show job-relevant skills or responsibilities. Add more detail on relevant technologies and outcomes.',
      });
    }

    return score;
  }

  private scoreEducation(
    jobContext: {
      broadSkills: Set<string>;
      fullText: string;
    },
    educations: Array<{ degree: string | null; fieldOfStudy: string | null }>,
    recommendations: Array<{ type: string; message: string }>,
  ): number {
    if (educations.length === 0) {
      recommendations.push({
        type: 'education',
        message: 'Add education entries to complete your profile.',
      });
      return 0;
    }

    const relevantEducation = educations.some((education) => {
      const educationText = `${education.degree ?? ''} ${education.fieldOfStudy ?? ''}`;
      const educationTerms = this.extractSkillTerms(educationText);
      return (
        this.intersectSets(jobContext.broadSkills, educationTerms).size > 0
      );
    });

    if (!relevantEducation) {
      recommendations.push({
        type: 'education',
        message:
          'Your education entries do not clearly connect to the job’s domain. Add relevant fields of study or certifications if you have them.',
      });
    }

    return relevantEducation ? 15 : 7;
  }

  private scoreProjects(
    jobContext: {
      broadSkills: Set<string>;
      fullText: string;
    },
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

    let totalProjectRelevance = 0;

    for (const project of projects) {
      const projectTerms = this.extractSkillTerms(
        `${project.description ?? ''} ${project.techStack ?? ''}`,
      );
      const relevance =
        this.intersectSets(jobContext.broadSkills, projectTerms).size /
        Math.max(jobContext.broadSkills.size, 1);
      totalProjectRelevance += Math.min(relevance, 1);
    }

    const averageRelevance = totalProjectRelevance / projects.length;
    const score = Math.min(Math.round(averageRelevance * 15), 15);

    if (score < 8) {
      recommendations.push({
        type: 'project',
        message:
          'Add or improve portfolio projects that demonstrate the job’s required technologies and responsibilities.',
      });
    }

    return score;
  }

  private buildJobContext(jobAd: {
    title: string;
    description: string;
    requirements: string;
  }) {
    const fullText = `${jobAd.title} ${jobAd.description} ${jobAd.requirements}`;
    const requiredSkills = this.extractRequirementTerms(
      jobAd.requirements,
      true,
    );
    const preferredSkills = this.extractRequirementTerms(
      jobAd.requirements,
      false,
    );
    const broadSkills = this.extractSkillTerms(fullText);

    if (requiredSkills.size === 0 && preferredSkills.size === 0) {
      return { requiredSkills, preferredSkills, broadSkills, fullText };
    }

    if (broadSkills.size === 0) {
      const fallback = new Set([...requiredSkills, ...preferredSkills]);
      return {
        requiredSkills,
        preferredSkills,
        broadSkills: fallback,
        fullText,
      };
    }

    return { requiredSkills, preferredSkills, broadSkills, fullText };
  }

  private buildCandidateContext(
    skills: Array<{ skillName: string; proficiencyLevel: string | null }>,
    workExperiences: Array<{ role: string; description: string | null }>,
    projects: Array<{ description: string | null; techStack: string | null }>,
    educations: Array<{ degree: string | null; fieldOfStudy: string | null }>,
  ) {
    const skillTerms = new Set<string>();

    for (const skill of skills) {
      this.extractSkillTerms(skill.skillName).forEach((term) =>
        skillTerms.add(term),
      );
    }

    for (const project of projects) {
      this.extractSkillTerms(
        `${project.description ?? ''} ${project.techStack ?? ''}`,
      ).forEach((term) => skillTerms.add(term));
    }

    for (const experience of workExperiences) {
      this.extractSkillTerms(
        `${experience.role} ${experience.description ?? ''}`,
      ).forEach((term) => skillTerms.add(term));
    }

    for (const education of educations) {
      this.extractSkillTerms(
        `${education.degree ?? ''} ${education.fieldOfStudy ?? ''}`,
      ).forEach((term) => skillTerms.add(term));
    }

    return { skillTerms };
  }

  private extractRequirementTerms(text: string, requiredOnly: boolean) {
    const normalizedText = this.normalizeText(text);
    const sentences = normalizedText
      .split(/\.|\n|;/)
      .map((sentence) => sentence.trim());
    const matches = new Set<string>();

    const requiredIndicators =
      /\b(required|must have|must|required experience|experience with|experience in|shall)\b/;
    const preferredIndicators =
      /\b(preferred|nice to have|optional|would be a plus|strongly preferred|should have)\b/;

    for (const sentence of sentences) {
      if (requiredOnly && !requiredIndicators.test(sentence)) {
        continue;
      }
      if (!requiredOnly && !preferredIndicators.test(sentence)) {
        continue;
      }
      this.matchKnownSkills(sentence).forEach((skill) => matches.add(skill));
    }

    return matches;
  }

  private extractSkillTerms(text: string) {
    const normalized = this.normalizeText(text);
    const terms = new Set<string>();

    this.matchKnownSkills(normalized).forEach((term) => terms.add(term));

    const tokens = normalized
      .replace(/[^a-z0-9+.#\s]/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 1)
      .map((token) => this.normalizeSkillToken(token));

    tokens.forEach((token) => {
      if (token) {
        terms.add(token);
      }
    });

    return terms;
  }

  private matchKnownSkills(text: string) {
    const found = new Set<string>();
    for (const phrase of KNOWN_SKILL_PHRASES) {
      if (text.includes(phrase)) {
        found.add(this.normalizeSkillToken(phrase));
      }
    }
    return found;
  }

  private normalizeText(text: string) {
    return text
      .toLowerCase()
      .replace(/\b(c\+\+|c#|c sharp)\b/g, (match) => {
        if (match.includes('c++')) return 'cpp';
        if (match.includes('c#')) return 'csharp';
        return 'csharp';
      })
      .replace(/\b(nodejs|node\.js|node)\b/g, 'node.js')
      .replace(/\b(reactjs|react\.js)\b/g, 'react')
      .replace(/\b(typescript|ts)\b/g, 'typescript')
      .replace(/\b(java script|js)\b/g, 'javascript')
      .replace(/\b(postgres|postgresql)\b/g, 'postgresql')
      .replace(/\b(graph ql|graphql)\b/g, 'graphql')
      .replace(/\b(ci\/?cd|ci cd)\b/g, 'ci/cd')
      .replace(/\b(aws|amazon web services)\b/g, 'aws')
      .replace(/\b(gcp|google cloud)\b/g, 'gcp')
      .replace(/\b(k8s|kubernetes)\b/g, 'kubernetes')
      .replace(/\b(rest api|restful api|rest)\b/g, 'rest api')
      .replace(/[^a-z0-9+.#\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private normalizeSkillToken(token: string) {
    const alias = SKILL_ALIAS_MAP[token.toLowerCase().trim()];
    return alias ?? token.toLowerCase().trim();
  }

  private intersectSets(setA: Set<string>, setB: Set<string>) {
    const result = new Set<string>();
    for (const item of setA) {
      if (setB.has(item)) {
        result.add(item);
      }
    }
    return result;
  }
}

const SKILL_ALIAS_MAP: Record<string, string> = {
  node: 'node.js',
  nodejs: 'node.js',
  'node.js': 'node.js',
  reactjs: 'react',
  'react.js': 'react',
  js: 'javascript',
  ts: 'typescript',
  aws: 'aws',
  gcp: 'gcp',
  azure: 'azure',
  postgres: 'postgresql',
  postgresql: 'postgresql',
  graphql: 'graphql',
  'rest api': 'rest api',
  'restful api': 'rest api',
  kubernetes: 'kubernetes',
  k8s: 'kubernetes',
  docker: 'docker',
  terraform: 'terraform',
  ci: 'ci/cd',
  'ci/cd': 'ci/cd',
  sql: 'sql',
  nosql: 'nosql',
  mongodb: 'mongodb',
  sequelize: 'sequelize',
  'unit testing': 'unit testing',
  'integration testing': 'integration testing',
  'micro services': 'microservices',
  'micro-service': 'microservices',
  cpp: 'cpp',
  csharp: 'csharp',
  'c#': 'csharp',
  'c++': 'cpp',
  html: 'html',
  css: 'css',
  redux: 'redux',
  rxjs: 'rxjs',
  nestjs: 'nestjs',
  'nest.js': 'nestjs',
  express: 'express',
  flask: 'flask',
  django: 'django',
  python: 'python',
  java: 'java',
  'spring boot': 'spring boot',
  android: 'android',
  ios: 'ios',
};

const KNOWN_SKILL_PHRASES = [
  'node.js',
  'react',
  'typescript',
  'javascript',
  'python',
  'django',
  'flask',
  'postgresql',
  'mongodb',
  'mysql',
  'sql',
  'nosql',
  'docker',
  'kubernetes',
  'aws',
  'azure',
  'gcp',
  'rest api',
  'graphql',
  'microservices',
  'ci/cd',
  'unit testing',
  'integration testing',
  'tdd',
  'terraform',
  'serverless',
  'nestjs',
  'express',
  'react native',
  'redux',
  'rxjs',
  'next.js',
  'nest.js',
  'spring boot',
  'java',
  'csharp',
  'cpp',
  'html',
  'css',
  'sass',
  'scss',
  'git',
  'linux',
  'docker-compose',
  'apache',
  'nginx',
];
