import path from 'path';
import fs from 'fs';
import os from 'os';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { ResumeTemplateRepository } from './resume-template.repository';
import { GeneratedResumeRepository } from './generated-resume.repository';
import { UserRepository } from '../users/users.repository';
import { JobAdvertisementRepository } from '../job-ads/job-advertisement.repository';
import { UserEducationRepository } from '../users/user-education.repository';
import { UserWorkExperienceRepository } from '../users/user-work-experience.repository';
import { UserSkillRepository } from '../users/user-skill.repository';
import { UserProjectRepository } from '../users/user-project.repository';
import { AtsScoreRepository } from '../ats/ats-score.repository';
import { ResumesPdfService } from './resumes-pdf.service';
import { ResumeTailoringService } from './resume-tailoring.service';
import type { TailoredResumeContent } from './resume-render.types';

jest.mock('./resumes-pdf.service', () => ({
  ResumesPdfService: class MockResumesPdfService {},
}));

describe('ResumesService', () => {
  let service: ResumesService;
  let resumeTemplateRepository: jest.Mocked<ResumeTemplateRepository>;
  let generatedResumeRepository: jest.Mocked<GeneratedResumeRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let jobAdRepository: jest.Mocked<JobAdvertisementRepository>;
  let educationRepository: jest.Mocked<UserEducationRepository>;
  let workExperienceRepository: jest.Mocked<UserWorkExperienceRepository>;
  let skillRepository: jest.Mocked<UserSkillRepository>;
  let projectRepository: jest.Mocked<UserProjectRepository>;
  let atsScoreRepository: jest.Mocked<AtsScoreRepository>;
  let resumesPdfService: jest.Mocked<ResumesPdfService>;
  let resumeTailoringService: jest.Mocked<ResumeTailoringService>;

  let tempDir: string;

  const mockJobAd = {
    id: 'job-ad-1',
    userId: 'user-1',
    title: 'Software Engineer',
    description: 'Build web applications.',
    requirements: 'Must have typescript.',
    location: 'Remote',
  };

  const mockTemplate = {
    id: 'template-1',
    name: 'Classic',
    language: 'en',
    isActive: true,
  };

  const mockAtsScore = { atsScore: '80' };

  const mockUser = {
    userId: 'user-1',
    name: 'John Doe',
    email: 'john@test.com',
  };

  const mockTailoredContent: TailoredResumeContent = {
    headline: 'Software Engineer',
    profileSummary: 'Targeted summary.',
    skills: [],
    workExperiences: [],
    projects: [],
    educations: [],
    omittedItemIds: {
      skillIds: [],
      workExperienceIds: [],
      projectIds: [],
      educationIds: [],
    },
  };

  const mockGeneratedResume = {
    id: 'resume-1',
    userId: 'user-1',
    jobAdId: 'job-ad-1',
    resumeTemplateId: 'template-1',
    atsScore: '80',
    filePath: 'resumes/resume-user-1-1700000000000.pdf',
    filename: 'classic_Resume_software_engineer.pdf',
    tailoredContent: mockTailoredContent,
    generatedAt: new Date('2024-01-01T00:00:00Z'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'resumes-spec-'));
    process.env.STORAGE_LOCATION = tempDir;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResumesService,
        {
          provide: ResumeTemplateRepository,
          useValue: {
            findActiveByLanguage: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: GeneratedResumeRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findAllByUserId: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
          },
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
          provide: AtsScoreRepository,
          useValue: {
            findByUserAndJobAd: jest.fn(),
          },
        },
        {
          provide: ResumesPdfService,
          useValue: {
            render: jest.fn(),
          },
        },
        {
          provide: ResumeTailoringService,
          useValue: {
            tailor: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(ResumesService);
    resumeTemplateRepository = module.get(ResumeTemplateRepository);
    generatedResumeRepository = module.get(GeneratedResumeRepository);
    userRepository = module.get(UserRepository);
    jobAdRepository = module.get(JobAdvertisementRepository);
    educationRepository = module.get(UserEducationRepository);
    workExperienceRepository = module.get(UserWorkExperienceRepository);
    skillRepository = module.get(UserSkillRepository);
    projectRepository = module.get(UserProjectRepository);
    atsScoreRepository = module.get(AtsScoreRepository);
    resumesPdfService = module.get(ResumesPdfService);
    resumeTailoringService = module.get(ResumeTailoringService);
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listTemplates', () => {
    it('should return templates for a single requested language', async () => {
      const expected = [{ id: 'template-1', language: 'en' }];
      resumeTemplateRepository.findActiveByLanguage.mockResolvedValue(
        expected as any,
      );

      const result = await service.listTemplates('en');

      expect(
        resumeTemplateRepository.findActiveByLanguage,
      ).toHaveBeenCalledWith('en');
      expect(result).toEqual(expected);
    });

    it('should combine English and Hindi templates when no language is given', async () => {
      const en = [{ id: 'template-en', language: 'en' }];
      const hi = [{ id: 'template-hi', language: 'hi' }];
      resumeTemplateRepository.findActiveByLanguage
        .mockResolvedValueOnce(en as any)
        .mockResolvedValueOnce(hi as any);

      const result = await service.listTemplates();

      expect(
        resumeTemplateRepository.findActiveByLanguage,
      ).toHaveBeenCalledWith('en');
      expect(
        resumeTemplateRepository.findActiveByLanguage,
      ).toHaveBeenCalledWith('hi');
      expect(result).toEqual([...en, ...hi]);
    });
  });

  describe('list', () => {
    it('should list the user resume rows and map atsScore to a number', async () => {
      generatedResumeRepository.findAllByUserId.mockResolvedValue([
        mockGeneratedResume,
      ] as any);

      const result = await service.list('user-1', 'job-ad-1');

      expect(generatedResumeRepository.findAllByUserId).toHaveBeenCalledWith(
        'user-1',
        'job-ad-1',
      );
      expect(result).toEqual([
        {
          id: 'resume-1',
          jobAdId: 'job-ad-1',
          resumeTemplateId: 'template-1',
          jobAdvertisement: undefined,
          resumeTemplate: undefined,
          filename: 'classic_Resume_software_engineer.pdf',
          atsScore: 80,
          generatedAt: mockGeneratedResume.generatedAt,
        },
      ]);
    });

    it('should list resumes without a job advertisement filter', async () => {
      generatedResumeRepository.findAllByUserId.mockResolvedValue([]);

      await service.list('user-1');

      expect(generatedResumeRepository.findAllByUserId).toHaveBeenCalledWith(
        'user-1',
        undefined,
      );
    });
  });

  describe('generate', () => {
    it('should throw NotFoundException when the job advertisement is not found', async () => {
      jobAdRepository.findByIdAndUserId.mockResolvedValue(null);

      await expect(
        service.generate('user-1', 'job-ad-1', 'template-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when the template is missing or inactive', async () => {
      jobAdRepository.findByIdAndUserId.mockResolvedValue(mockJobAd as any);
      resumeTemplateRepository.findById.mockResolvedValue(null);

      await expect(
        service.generate('user-1', 'job-ad-1', 'template-1'),
      ).rejects.toThrow(NotFoundException);

      resumeTemplateRepository.findById.mockResolvedValue({
        ...mockTemplate,
        isActive: false,
      } as any);

      await expect(
        service.generate('user-1', 'job-ad-1', 'template-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when the ATS score is missing or below threshold', async () => {
      jobAdRepository.findByIdAndUserId.mockResolvedValue(mockJobAd as any);
      resumeTemplateRepository.findById.mockResolvedValue(mockTemplate as any);
      atsScoreRepository.findByUserAndJobAd.mockResolvedValue(null);

      await expect(
        service.generate('user-1', 'job-ad-1', 'template-1'),
      ).rejects.toThrow(ForbiddenException);

      atsScoreRepository.findByUserAndJobAd.mockResolvedValue({
        atsScore: '10',
      } as any);

      await expect(
        service.generate('user-1', 'job-ad-1', 'template-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      jobAdRepository.findByIdAndUserId.mockResolvedValue(mockJobAd as any);
      resumeTemplateRepository.findById.mockResolvedValue(mockTemplate as any);
      atsScoreRepository.findByUserAndJobAd.mockResolvedValue(
        mockAtsScore as any,
      );
      userRepository.findById.mockResolvedValue(null);

      await expect(
        service.generate('user-1', 'job-ad-1', 'template-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should generate, persist and return a resume', async () => {
      jobAdRepository.findByIdAndUserId.mockResolvedValue(mockJobAd as any);
      resumeTemplateRepository.findById.mockResolvedValue(mockTemplate as any);
      atsScoreRepository.findByUserAndJobAd.mockResolvedValue(
        mockAtsScore as any,
      );
      userRepository.findById.mockResolvedValue(mockUser as any);
      educationRepository.findAllByUserId.mockResolvedValue([]);
      workExperienceRepository.findAllByUserId.mockResolvedValue([]);
      skillRepository.findAllByUserId.mockResolvedValue([]);
      projectRepository.findAllByUserId.mockResolvedValue([]);
      resumeTailoringService.tailor.mockResolvedValue(mockTailoredContent);
      resumesPdfService.render.mockResolvedValue(Buffer.from('pdf-bytes'));
      generatedResumeRepository.create.mockResolvedValue(
        mockGeneratedResume as any,
      );

      const result = await service.generate('user-1', 'job-ad-1', 'template-1');

      expect(resumeTailoringService.tailor).toHaveBeenCalledWith(
        expect.objectContaining({
          user: mockUser,
          jobAd: mockJobAd,
          language: 'en',
        }),
      );
      expect(generatedResumeRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          jobAdId: 'job-ad-1',
          resumeTemplateId: 'template-1',
          atsScore: '80',
          filename: 'classic_Resume_software_engineer.pdf',
          tailoredContent: mockTailoredContent,
        }),
      );
      const createArgs = generatedResumeRepository.create.mock.calls[0][0];
      expect(createArgs.filePath).toMatch(/^resumes\/resume-user-1-\d+\.pdf$/);
      expect(createArgs.generatedAt).toBeInstanceOf(Date);

      const writtenFile = path.join(
        tempDir,
        'resumes',
        path.basename(createArgs.filePath),
      );
      expect(fs.existsSync(writtenFile)).toBe(true);

      expect(result).toEqual({
        previewId: mockGeneratedResume.id,
        filename: mockGeneratedResume.filename,
        atsScore: 80,
        generatedAt: mockGeneratedResume.generatedAt,
      });
    });

    it('should use the requested language instead of the template default', async () => {
      jobAdRepository.findByIdAndUserId.mockResolvedValue(mockJobAd as any);
      resumeTemplateRepository.findById.mockResolvedValue(mockTemplate as any);
      atsScoreRepository.findByUserAndJobAd.mockResolvedValue(
        mockAtsScore as any,
      );
      userRepository.findById.mockResolvedValue(mockUser as any);
      educationRepository.findAllByUserId.mockResolvedValue([]);
      workExperienceRepository.findAllByUserId.mockResolvedValue([]);
      skillRepository.findAllByUserId.mockResolvedValue([]);
      projectRepository.findAllByUserId.mockResolvedValue([]);
      resumeTailoringService.tailor.mockResolvedValue(mockTailoredContent);
      resumesPdfService.render.mockResolvedValue(Buffer.from('pdf-bytes'));
      generatedResumeRepository.create.mockResolvedValue(
        mockGeneratedResume as any,
      );

      await service.generate('user-1', 'job-ad-1', 'template-1', 'hi');

      expect(resumeTailoringService.tailor).toHaveBeenCalledWith(
        expect.objectContaining({ language: 'hi' }),
      );
    });
  });

  describe('preview', () => {
    it('should throw NotFoundException when the resume does not exist', async () => {
      generatedResumeRepository.findById.mockResolvedValue(null);

      await expect(service.preview('resume-1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when the resume belongs to another user', async () => {
      generatedResumeRepository.findById.mockResolvedValue({
        ...mockGeneratedResume,
        userId: 'other-user',
      } as any);

      await expect(service.preview('resume-1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when the resume file is missing on disk', async () => {
      generatedResumeRepository.findById.mockResolvedValue(
        mockGeneratedResume as any,
      );

      await expect(service.preview('resume-1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return preview data when the resume file exists', async () => {
      const filePath = path.join(tempDir, 'resumes', 'existing.pdf');
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, 'pdf-bytes');
      generatedResumeRepository.findById.mockResolvedValue({
        ...mockGeneratedResume,
        filePath: 'resumes/existing.pdf',
      } as any);

      const result = await service.preview('resume-1', 'user-1');

      expect(result).toEqual({
        previewId: 'resume-1',
        filename: mockGeneratedResume.filename,
        atsScore: 80,
        generatedAt: mockGeneratedResume.generatedAt,
      });
    });
  });

  describe('getFilePath', () => {
    it('should throw NotFoundException when the resume does not exist', async () => {
      generatedResumeRepository.findById.mockResolvedValue(null);

      await expect(service.getFilePath('resume-1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when the resume belongs to another user', async () => {
      generatedResumeRepository.findById.mockResolvedValue({
        ...mockGeneratedResume,
        userId: 'other-user',
      } as any);

      await expect(service.getFilePath('resume-1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should resolve the absolute path of the resume file', async () => {
      generatedResumeRepository.findById.mockResolvedValue(
        mockGeneratedResume as any,
      );

      const result = await service.getFilePath('resume-1', 'user-1');

      expect(result).toBe(path.join(tempDir, mockGeneratedResume.filePath));
    });
  });
});
