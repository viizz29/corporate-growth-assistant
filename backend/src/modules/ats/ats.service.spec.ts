import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AtsService, ATS_SCORE_THRESHOLD } from './ats.service';
import { AtsScoreRepository } from './ats-score.repository';
import { UserRepository } from '../users/users.repository';
import { JobAdvertisementRepository } from '../job-ads/job-advertisement.repository';
import { UserEducationRepository } from '../users/user-education.repository';
import { UserWorkExperienceRepository } from '../users/user-work-experience.repository';
import { UserSkillRepository } from '../users/user-skill.repository';
import { UserProjectRepository } from '../users/user-project.repository';
import { OpenAiService, AtsAiFeedback } from '../../lib/openai.service';

describe('AtsService', () => {
  let service: AtsService;
  let atsScoreRepository: jest.Mocked<AtsScoreRepository>;
  let jobAdRepository: jest.Mocked<JobAdvertisementRepository>;
  let educationRepository: jest.Mocked<UserEducationRepository>;
  let workExperienceRepository: jest.Mocked<UserWorkExperienceRepository>;
  let skillRepository: jest.Mocked<UserSkillRepository>;
  let projectRepository: jest.Mocked<UserProjectRepository>;
  let openAiService: jest.Mocked<OpenAiService>;

  const mockJobAd = {
    id: 'job-ad-1',
    userId: 'user-1',
    title: 'Software Engineer',
    description: 'We build web applications with react and node.js.',
    requirements:
      'Must have typescript, react, node.js, postgresql, docker and aws.',
  };

  const aiFeedback: AtsAiFeedback = {
    currentScore: 50,
    summary: 'Good overall fit.',
    strengths: ['Strong backend skills'],
    weaknesses: ['Missing some tools'],
    improvementAreas: [{ area: 'Testing', detail: 'Add testing experience' }],
    skillRecommendations: [
      { skill: 'graphql', why: 'Used in the job description' },
    ],
    projectSuggestions: [
      {
        name: 'API service',
        description: 'Build a REST API',
        skills: ['node.js'],
        why: 'Showcases backend skill',
      },
    ],
  };

  const mockSavedRow = {
    userId: 'user-1',
    jobAdId: 'job-ad-1',
    atsScore: '50',
    recommendations: [{ type: 'skill', message: 'Add skills' }],
    aiFeedback,
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AtsService,
        {
          provide: AtsScoreRepository,
          useValue: {
            upsert: jest.fn(),
            findAllByUserId: jest.fn(),
            findByUserAndJobAd: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {},
        },
        {
          provide: JobAdvertisementRepository,
          useValue: {
            findByIdAndUserId: jest.fn(),
          },
        },
        {
          provide: UserEducationRepository,
          useValue: {
            findAllByUserId: jest.fn(),
          },
        },
        {
          provide: UserWorkExperienceRepository,
          useValue: {
            findAllByUserId: jest.fn(),
          },
        },
        {
          provide: UserSkillRepository,
          useValue: {
            findAllByUserId: jest.fn(),
          },
        },
        {
          provide: UserProjectRepository,
          useValue: {
            findAllByUserId: jest.fn(),
          },
        },
        {
          provide: OpenAiService,
          useValue: {
            generateAtsFeedback: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(AtsService);
    atsScoreRepository = module.get(AtsScoreRepository);
    jobAdRepository = module.get(JobAdvertisementRepository);
    educationRepository = module.get(UserEducationRepository);
    workExperienceRepository = module.get(UserWorkExperienceRepository);
    skillRepository = module.get(UserSkillRepository);
    projectRepository = module.get(UserProjectRepository);
    openAiService = module.get(OpenAiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('compute', () => {
    it('should throw NotFoundException when the job advertisement is not found', async () => {
      jobAdRepository.findByIdAndUserId.mockResolvedValue(null);

      await expect(service.compute('user-1', 'job-ad-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(atsScoreRepository.upsert).not.toHaveBeenCalled();
    });

    it('should compute, persist and return an ATS score with AI feedback', async () => {
      jobAdRepository.findByIdAndUserId.mockResolvedValue(mockJobAd as any);
      educationRepository.findAllByUserId.mockResolvedValue([]);
      workExperienceRepository.findAllByUserId.mockResolvedValue([]);
      skillRepository.findAllByUserId.mockResolvedValue([]);
      projectRepository.findAllByUserId.mockResolvedValue([]);
      openAiService.generateAtsFeedback.mockResolvedValue(aiFeedback);
      atsScoreRepository.upsert.mockResolvedValue(mockSavedRow as any);

      const result = await service.compute('user-1', 'job-ad-1');

      expect(jobAdRepository.findByIdAndUserId).toHaveBeenCalledWith(
        'job-ad-1',
        'user-1',
      );
      expect(openAiService.generateAtsFeedback).toHaveBeenCalledWith(
        expect.objectContaining({
          jobAd: mockJobAd,
          localScore: expect.any(Number),
        }),
      );
      expect(atsScoreRepository.upsert).toHaveBeenCalledWith(
        'user-1',
        'job-ad-1',
        expect.objectContaining({
          atsScore: expect.any(Number),
          recommendations: expect.any(Array),
          aiFeedback,
        }),
      );
      expect(result).toEqual({
        userId: 'user-1',
        jobAdId: 'job-ad-1',
        atsScore: 50,
        recommendations: mockSavedRow.recommendations,
        aiFeedback,
        computedAt: mockSavedRow.updatedAt,
        atsThreshold: ATS_SCORE_THRESHOLD,
      });
    });

    it('should keep the local score when AI feedback generation fails', async () => {
      jobAdRepository.findByIdAndUserId.mockResolvedValue(mockJobAd as any);
      educationRepository.findAllByUserId.mockResolvedValue([]);
      workExperienceRepository.findAllByUserId.mockResolvedValue([]);
      skillRepository.findAllByUserId.mockResolvedValue([]);
      projectRepository.findAllByUserId.mockResolvedValue([]);
      openAiService.generateAtsFeedback.mockRejectedValue(
        new Error('AI unavailable'),
      );
      atsScoreRepository.upsert.mockResolvedValue({
        ...mockSavedRow,
        aiFeedback: null,
      } as any);

      const result = await service.compute('user-1', 'job-ad-1');

      expect(atsScoreRepository.upsert).toHaveBeenCalledWith(
        'user-1',
        'job-ad-1',
        expect.objectContaining({ aiFeedback: null }),
      );
      expect(result.aiFeedback).toBeNull();
      expect(result.atsScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('listForUser', () => {
    it('should return all cached scores mapped to the response shape', async () => {
      atsScoreRepository.findAllByUserId.mockResolvedValue([
        mockSavedRow,
      ] as any);

      const result = await service.listForUser('user-1');

      expect(atsScoreRepository.findAllByUserId).toHaveBeenCalledWith('user-1');
      expect(result).toEqual([
        {
          userId: 'user-1',
          jobAdId: 'job-ad-1',
          atsScore: 50,
          recommendations: mockSavedRow.recommendations,
          aiFeedback,
          computedAt: mockSavedRow.updatedAt,
          atsThreshold: ATS_SCORE_THRESHOLD,
        },
      ]);
    });

    it('should return an empty list when no scores exist', async () => {
      atsScoreRepository.findAllByUserId.mockResolvedValue([]);

      await expect(service.listForUser('user-1')).resolves.toEqual([]);
    });
  });

  describe('findByUserAndJobAd', () => {
    it('should return the cached score for a job advertisement', async () => {
      atsScoreRepository.findByUserAndJobAd.mockResolvedValue(
        mockSavedRow as any,
      );

      const result = await service.findByUserAndJobAd('user-1', 'job-ad-1');

      expect(atsScoreRepository.findByUserAndJobAd).toHaveBeenCalledWith(
        'user-1',
        'job-ad-1',
      );
      expect(result).toEqual({
        userId: 'user-1',
        jobAdId: 'job-ad-1',
        atsScore: 50,
        recommendations: mockSavedRow.recommendations,
        aiFeedback,
        computedAt: mockSavedRow.updatedAt,
        atsThreshold: ATS_SCORE_THRESHOLD,
      });
    });

    it('should throw NotFoundException when no score is cached', async () => {
      atsScoreRepository.findByUserAndJobAd.mockResolvedValue(null);

      await expect(
        service.findByUserAndJobAd('user-1', 'job-ad-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('calculateScore', () => {
    it('should return a score of 0 with a recommendation per category for an empty profile', () => {
      const { score, recommendations } = (service as any).calculateScore(
        mockJobAd,
        [],
        [],
        [],
        [],
      );

      expect(score).toBe(0);
      expect(recommendations.map((r: { type: string }) => r.type)).toEqual(
        expect.arrayContaining(['skill', 'experience', 'education', 'project']),
      );
    });

    it('should give a high score and no missing-category recommendations for a strong profile', () => {
      const { score, recommendations } = (service as any).calculateScore(
        mockJobAd,
        [
          {
            institution: 'MIT',
            degree: 'BSc',
            fieldOfStudy: 'Computer Science',
          },
        ],
        [
          {
            company: 'Acme',
            role: 'Software Engineer',
            description:
              'Built web applications with typescript, react, node.js, postgresql, docker and aws.',
          },
        ],
        [
          { skillName: 'typescript', proficiencyLevel: 'advanced' },
          { skillName: 'react', proficiencyLevel: 'advanced' },
          { skillName: 'node.js', proficiencyLevel: 'advanced' },
          { skillName: 'postgresql', proficiencyLevel: 'advanced' },
          { skillName: 'docker', proficiencyLevel: 'intermediate' },
          { skillName: 'aws', proficiencyLevel: 'intermediate' },
        ],
        [
          {
            projectName: 'Dashboard',
            description: 'Built a dashboard with react and node.js',
            techStack: 'typescript, postgresql, docker, aws',
          },
        ],
      );

      expect(score).toBeGreaterThanOrEqual(70);
      expect(score).toBeLessThanOrEqual(100);
      const types = recommendations.map((r: { type: string }) => r.type);
      expect(types).not.toContain('skill');
      expect(types).not.toContain('experience');
    });

    it('should never exceed a score of 100', () => {
      const { score } = (service as any).calculateScore(
        {
          title: 'Full Stack Engineer',
          description: 'typescript react node.js postgresql docker aws',
          requirements:
            'Must have typescript, react, node.js, postgresql, docker and aws.',
        },
        [
          {
            institution: 'MIT',
            degree: 'BSc',
            fieldOfStudy: 'Computer Science',
          },
        ],
        [
          {
            company: 'Acme',
            role: 'Full Stack Engineer',
            description:
              'Built web applications with typescript react node.js postgresql docker aws',
          },
        ],
        [
          { skillName: 'typescript', proficiencyLevel: 'advanced' },
          { skillName: 'react', proficiencyLevel: 'advanced' },
          { skillName: 'node.js', proficiencyLevel: 'advanced' },
          { skillName: 'postgresql', proficiencyLevel: 'advanced' },
          { skillName: 'docker', proficiencyLevel: 'advanced' },
          { skillName: 'aws', proficiencyLevel: 'advanced' },
        ],
        [
          {
            projectName: 'Dashboard',
            description: 'react node.js postgresql',
            techStack: 'typescript docker aws',
          },
        ],
      );

      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('scoreSkills', () => {
    it('should return 0 and recommend adding skills when the candidate has none', () => {
      const recommendations: Array<{ type: string; message: string }> = [];
      const jobContext = {
        requiredSkills: new Set(['typescript']),
        preferredSkills: new Set<string>(),
        broadSkills: new Set(['typescript']),
        fullText: 'typescript',
      };

      const score = (service as any).scoreSkills(
        jobContext,
        { skillTerms: new Set<string>() },
        recommendations,
      );

      expect(score).toBe(0);
      expect(recommendations).toContainEqual({
        type: 'skill',
        message: 'Add skills to your profile to improve your ATS score.',
      });
    });

    it('should award the maximum for a full required, preferred and broad match', () => {
      const recommendations: Array<{ type: string; message: string }> = [];
      const jobContext = {
        requiredSkills: new Set(['typescript', 'react']),
        preferredSkills: new Set(['node.js']),
        broadSkills: new Set(['typescript', 'react', 'node.js']),
        fullText: 'x',
      };

      const score = (service as any).scoreSkills(
        jobContext,
        { skillTerms: new Set(['typescript', 'react', 'node.js']) },
        recommendations,
      );

      expect(score).toBe(45);
      expect(recommendations).toHaveLength(0);
    });

    it('should list missing required skills in a recommendation', () => {
      const recommendations: Array<{ type: string; message: string }> = [];
      const jobContext = {
        requiredSkills: new Set(['typescript']),
        preferredSkills: new Set<string>(),
        broadSkills: new Set(['react']),
        fullText: 'x',
      };

      const score = (service as any).scoreSkills(
        jobContext,
        { skillTerms: new Set(['react']) },
        recommendations,
      );

      expect(score).toBeGreaterThanOrEqual(0);
      expect(recommendations).toContainEqual({
        type: 'skill',
        message:
          'The job requires typescript. Add those skills to improve relevance.',
      });
    });

    it('should recommend more domain-specific skills when broad overlap is low', () => {
      const recommendations: Array<{ type: string; message: string }> = [];
      const jobContext = {
        requiredSkills: new Set<string>(),
        preferredSkills: new Set<string>(),
        broadSkills: new Set(['react', 'node.js']),
        fullText: 'x',
      };

      const score = (service as any).scoreSkills(
        jobContext,
        { skillTerms: new Set(['ruby']) },
        recommendations,
      );

      expect(score).toBe(0);
      expect(recommendations).toContainEqual(
        expect.objectContaining({
          type: 'skill',
        }),
      );
    });
  });

  describe('scoreExperience', () => {
    it('should return 0 and recommend adding experience when there is none', () => {
      const recommendations: Array<{ type: string; message: string }> = [];

      const score = (service as any).scoreExperience(
        { broadSkills: new Set(['react']), fullText: 'x' },
        [],
        recommendations,
      );

      expect(score).toBe(0);
      expect(recommendations).toContainEqual({
        type: 'experience',
        message: 'Add work experience entries to strengthen your profile.',
      });
    });

    it('should award points for job-relevant experience', () => {
      const recommendations: Array<{ type: string; message: string }> = [];

      const score = (service as any).scoreExperience(
        { broadSkills: new Set(['react']), fullText: 'x' },
        [
          {
            role: 'React Developer',
            description: 'Built react interfaces',
          },
        ],
        recommendations,
      );

      expect(score).toBe(14);
      expect(recommendations).toHaveLength(0);
    });

    it('should flag experience that does not mention relevant skills', () => {
      const recommendations: Array<{ type: string; message: string }> = [];

      const score = (service as any).scoreExperience(
        { broadSkills: new Set(['react']), fullText: 'x' },
        [
          {
            role: 'Cashier',
            description: 'Handled cash and customers',
          },
        ],
        recommendations,
      );

      expect(score).toBe(0);
      expect(recommendations).toContainEqual(
        expect.objectContaining({
          type: 'experience',
        }),
      );
    });
  });

  describe('scoreEducation', () => {
    it('should return 0 and recommend adding education when there is none', () => {
      const recommendations: Array<{ type: string; message: string }> = [];

      const score = (service as any).scoreEducation(
        { broadSkills: new Set(['react']), fullText: 'x' },
        [],
        recommendations,
      );

      expect(score).toBe(0);
      expect(recommendations).toContainEqual({
        type: 'education',
        message: 'Add education entries to complete your profile.',
      });
    });

    it('should award full points for a relevant field of study', () => {
      const recommendations: Array<{ type: string; message: string }> = [];

      const score = (service as any).scoreEducation(
        { broadSkills: new Set(['computer', 'science']), fullText: 'x' },
        [
          {
            degree: 'BSc',
            fieldOfStudy: 'Computer Science',
          },
        ],
        recommendations,
      );

      expect(score).toBe(15);
      expect(recommendations).toHaveLength(0);
    });

    it('should award partial points and recommend relevance for unrelated education', () => {
      const recommendations: Array<{ type: string; message: string }> = [];

      const score = (service as any).scoreEducation(
        { broadSkills: new Set(['react', 'node.js']), fullText: 'x' },
        [
          {
            degree: 'BA',
            fieldOfStudy: 'History',
          },
        ],
        recommendations,
      );

      expect(score).toBe(7);
      expect(recommendations).toContainEqual(
        expect.objectContaining({
          type: 'education',
        }),
      );
    });
  });

  describe('scoreProjects', () => {
    it('should return 0 and recommend adding projects when there are none', () => {
      const recommendations: Array<{ type: string; message: string }> = [];

      const score = (service as any).scoreProjects(
        { broadSkills: new Set(['react']), fullText: 'x' },
        [],
        recommendations,
      );

      expect(score).toBe(0);
      expect(recommendations).toContainEqual({
        type: 'project',
        message: 'Add project entries to showcase relevant work.',
      });
    });

    it('should award full points for a project using the required stack', () => {
      const recommendations: Array<{ type: string; message: string }> = [];

      const score = (service as any).scoreProjects(
        { broadSkills: new Set(['react', 'typescript']), fullText: 'x' },
        [
          {
            description: 'react dashboard',
            techStack: 'typescript',
          },
        ],
        recommendations,
      );

      expect(score).toBe(15);
      expect(recommendations).toHaveLength(0);
    });

    it('should flag projects unrelated to the job', () => {
      const recommendations: Array<{ type: string; message: string }> = [];

      const score = (service as any).scoreProjects(
        { broadSkills: new Set(['react', 'node.js']), fullText: 'x' },
        [
          {
            description: 'ruby gem',
            techStack: 'rake',
          },
        ],
        recommendations,
      );

      expect(score).toBe(0);
      expect(recommendations).toContainEqual(
        expect.objectContaining({
          type: 'project',
        }),
      );
    });
  });

  describe('buildJobContext', () => {
    it('should extract required skills from requirement statements', () => {
      const context = (service as any).buildJobContext({
        title: 'Backend Engineer',
        description: 'Build APIs',
        requirements: 'Must have typescript and react.',
      });

      expect(context.requiredSkills.has('typescript')).toBe(true);
      expect(context.requiredSkills.has('react')).toBe(true);
    });

    it('should extract preferred skills from nice-to-have statements', () => {
      const context = (service as any).buildJobContext({
        title: 'Backend Engineer',
        description: 'Build APIs',
        requirements: 'Must have typescript. Preferred: docker and kubernetes.',
      });

      expect(context.preferredSkills.has('docker')).toBe(true);
      expect(context.preferredSkills.has('kubernetes')).toBe(true);
    });

    it('should build broad skills from the full job text', () => {
      const context = (service as any).buildJobContext({
        title: 'Backend Engineer',
        description: 'We use typescript and postgresql.',
        requirements: '',
      });

      expect(context.broadSkills.has('typescript')).toBe(true);
      expect(context.broadSkills.has('postgresql')).toBe(true);
    });
  });

  describe('normalizeText', () => {
    it('should normalize common technology aliases', () => {
      const normalizeText = (service as any).normalizeText;
      expect(normalizeText('ReactJS')).toContain('react');
      expect(normalizeText('PostgreSQL')).toContain('postgresql');
      expect(normalizeText('TypeScript')).toContain('typescript');
      expect(normalizeText('GraphQL')).toContain('graphql');
    });
  });
});
