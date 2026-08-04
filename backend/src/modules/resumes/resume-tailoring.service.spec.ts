import { ResumeTailoringService } from './resume-tailoring.service';
import type { OpenAiService } from '../../lib/openai.service';

describe('ResumeTailoringService', () => {
  let service: ResumeTailoringService;
  let openAiService: jest.Mocked<OpenAiService>;

  beforeEach(() => {
    openAiService = {
      generateTailoredResumeContent: jest.fn(),
    } as unknown as jest.Mocked<OpenAiService>;

    service = new ResumeTailoringService(openAiService);
  });

  it('uses AI-selected items and rewritten descriptions when available', async () => {
    openAiService.generateTailoredResumeContent.mockResolvedValue({
      headline: 'Backend Engineer | APIs and AI Workflows',
      profileSummary: 'Tailored summary.',
      selectedSkillIds: ['skill-2'],
      selectedWorkExperiences: [
        {
          id: 'work-1',
          rewrittenDescription: 'Rewritten experience description.',
          relevanceReason: 'Direct backend API fit.',
        },
      ],
      selectedProjects: [
        {
          id: 'project-2',
          rewrittenDescription: 'Rewritten project description.',
          relevanceReason: 'Strong alignment with AI tooling.',
        },
      ],
      selectedEducationIds: ['education-1'],
      omittedItemIds: {
        skillIds: ['skill-1'],
        workExperienceIds: ['work-2'],
        projectIds: ['project-1'],
        educationIds: ['education-2'],
      },
    });

    const result = await service.tailor(buildInput());

    expect(result.headline).toBe('Backend Engineer | APIs and AI Workflows');
    expect(result.profileSummary).toBe('Tailored summary.');
    expect(result.skills.map((skill) => skill.id)).toEqual(['skill-2']);
    expect(result.workExperiences).toEqual([
      expect.objectContaining({
        id: 'work-1',
        description: 'Rewritten experience description.',
        relevanceReason: 'Direct backend API fit.',
      }),
    ]);
    expect(result.projects).toEqual([
      expect.objectContaining({
        id: 'project-2',
        description: 'Rewritten project description.',
        relevanceReason: 'Strong alignment with AI tooling.',
      }),
    ]);
    expect(result.educations.map((education) => education.id)).toEqual([
      'education-1',
    ]);
    expect(result.omittedItemIds).toEqual({
      skillIds: ['skill-1'],
      workExperienceIds: ['work-2'],
      projectIds: ['project-1'],
      educationIds: ['education-2'],
    });
  });

  it('falls back to original profile content when AI tailoring is unavailable', async () => {
    openAiService.generateTailoredResumeContent.mockResolvedValue(null);

    const result = await service.tailor(buildInput());

    expect(result.skills.map((skill) => skill.id)).toEqual(['skill-1', 'skill-2']);
    expect(result.workExperiences.map((experience) => experience.id)).toEqual([
      'work-1',
      'work-2',
    ]);
    expect(result.projects.map((project) => project.id)).toEqual([
      'project-1',
      'project-2',
    ]);
    expect(result.educations.map((education) => education.id)).toEqual([
      'education-1',
      'education-2',
    ]);
    expect(result.profileSummary).toContain('Senior Software Engineer');
    expect(result.omittedItemIds).toEqual({
      skillIds: [],
      workExperienceIds: [],
      projectIds: [],
      educationIds: [],
    });
  });
});

function buildInput() {
  return {
    language: 'en',
    user: {
      userId: 'user-1',
      name: 'Alex Candidate',
      email: 'alex@example.com',
    },
    jobAd: {
      id: 'job-1',
      title: 'Senior Software Engineer',
      description: 'Build backend systems and AI-enabled product workflows.',
      requirements: 'NestJS, PostgreSQL, APIs, prompt design',
      location: 'Remote',
    },
    educations: [
      {
        id: 'education-1',
        institution: 'State University',
        degree: 'B.Tech',
        fieldOfStudy: 'Computer Science',
        startDate: '2016-01-01',
        endDate: '2020-01-01',
        description: 'Core CS coursework.',
      },
      {
        id: 'education-2',
        institution: 'Online Academy',
        degree: null,
        fieldOfStudy: null,
        startDate: null,
        endDate: null,
        description: null,
      },
    ],
    workExperiences: [
      {
        id: 'work-1',
        company: 'Acme',
        role: 'Backend Engineer',
        startDate: '2022-01-01',
        endDate: null,
        description: 'Built APIs and data services.',
      },
      {
        id: 'work-2',
        company: 'Old Co',
        role: 'Support Engineer',
        startDate: '2020-01-01',
        endDate: '2021-12-31',
        description: 'Handled operations support.',
      },
    ],
    skills: [
      {
        id: 'skill-1',
        skillName: 'Excel',
        proficiencyLevel: null,
      },
      {
        id: 'skill-2',
        skillName: 'NestJS',
        proficiencyLevel: 'Advanced',
      },
    ],
    projects: [
      {
        id: 'project-1',
        projectName: 'Legacy Portal',
        description: 'Maintained a portal.',
        startDate: '2021-01-01',
        endDate: '2021-12-31',
        techStack: 'PHP',
      },
      {
        id: 'project-2',
        projectName: 'Resume AI',
        description: 'Built resume tailoring workflows.',
        startDate: '2024-01-01',
        endDate: null,
        techStack: 'NestJS, OpenAI, PostgreSQL',
      },
    ],
  } as any;
}
