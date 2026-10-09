import { Test, TestingModule } from '@nestjs/testing';
import { ResumesController } from './resumes.controller';
import { ResumesService } from './resumes.service';

jest.mock('./resumes-pdf.service', () => ({
  ResumesPdfService: class MockResumesPdfService {},
}));

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  createReadStream: jest.fn(),
}));

import { createReadStream } from 'fs';

describe('ResumesController', () => {
  let controller: ResumesController;
  let resumesService: jest.Mocked<ResumesService>;
  const mockCreateReadStream = createReadStream as jest.MockedFunction<
    typeof createReadStream
  >;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResumesController],
      providers: [
        {
          provide: ResumesService,
          useValue: {
            list: jest.fn(),
            listTemplates: jest.fn(),
            generate: jest.fn(),
            generateGeneral: jest.fn(),
            preview: jest.fn(),
            getFilePath: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(ResumesController);
    resumesService = module.get(ResumesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('list', () => {
    it('should list the user resumes filtered by job advertisement', async () => {
      const user = { userId: 'user-1' };
      const expected = [{ id: 'resume-1' }];
      resumesService.list.mockResolvedValue(expected as any);

      const result = await controller.list('job-ad-1', user);

      expect(resumesService.list).toHaveBeenCalledWith('user-1', 'job-ad-1');
      expect(result).toEqual(expected);
    });

    it('should list the user resumes without a job advertisement filter', async () => {
      const user = { userId: 'user-1' };
      resumesService.list.mockResolvedValue([]);

      await controller.list(undefined, user);

      expect(resumesService.list).toHaveBeenCalledWith('user-1', undefined);
    });
  });

  describe('listTemplates', () => {
    it('should list templates for a requested language', async () => {
      resumesService.listTemplates.mockResolvedValue([]);

      await controller.listTemplates('en');

      expect(resumesService.listTemplates).toHaveBeenCalledWith('en');
    });

    it('should list templates for all languages when none is requested', async () => {
      resumesService.listTemplates.mockResolvedValue([]);

      await controller.listTemplates(undefined);

      expect(resumesService.listTemplates).toHaveBeenCalledWith(undefined);
    });
  });

  describe('generate', () => {
    it('should generate a resume for the authenticated user', async () => {
      const user = { userId: 'user-1' };
      const dto = {
        jobAdId: 'job-ad-1',
        resumeTemplateId: 'template-1',
        language: 'en',
      };
      const expected = { previewId: 'resume-1' };
      resumesService.generate.mockResolvedValue(expected as any);

      const result = await controller.generate(dto, user);

      expect(resumesService.generate).toHaveBeenCalledWith(
        'user-1',
        'job-ad-1',
        'template-1',
        'en',
      );
      expect(result).toEqual(expected);
    });

    it('should pass an undefined language when not provided', async () => {
      const user = { userId: 'user-1' };
      const dto = { jobAdId: 'job-ad-1', resumeTemplateId: 'template-1' };
      resumesService.generate.mockResolvedValue({} as any);

      await controller.generate(dto, user);

      expect(resumesService.generate).toHaveBeenCalledWith(
        'user-1',
        'job-ad-1',
        'template-1',
        undefined,
      );
    });
  });

  describe('generateGeneral', () => {
    it('should generate a general purpose resume for the authenticated user', async () => {
      const user = { userId: 'user-1' };
      const dto = { resumeTemplateId: 'template-1', language: 'en' };
      const expected = { previewId: 'resume-1' };
      resumesService.generateGeneral.mockResolvedValue(expected as any);

      const result = await controller.generateGeneral(dto, user);

      expect(resumesService.generateGeneral).toHaveBeenCalledWith(
        'user-1',
        'template-1',
        'en',
      );
      expect(result).toEqual(expected);
    });

    it('should pass an undefined language when not provided', async () => {
      const user = { userId: 'user-1' };
      const dto = { resumeTemplateId: 'template-1' };
      resumesService.generateGeneral.mockResolvedValue({} as any);

      await controller.generateGeneral(dto, user);

      expect(resumesService.generateGeneral).toHaveBeenCalledWith(
        'user-1',
        'template-1',
        undefined,
      );
    });
  });

  describe('preview', () => {
    it('should stream the resume inline by default', async () => {
      const user = { userId: 'user-1' };
      const res = { set: jest.fn() } as any;
      const stream = { pipe: jest.fn() };
      resumesService.preview.mockResolvedValue({
        previewId: 'resume-1',
        filename: 'resume.pdf',
      } as any);
      resumesService.getFilePath.mockResolvedValue('/tmp/resume.pdf');
      mockCreateReadStream.mockReturnValue(stream as any);

      await controller.preview('resume-1', undefined, user, res);

      expect(resumesService.preview).toHaveBeenCalledWith('resume-1', 'user-1');
      expect(resumesService.getFilePath).toHaveBeenCalledWith(
        'resume-1',
        'user-1',
      );
      expect(res.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'inline; filename="resume.pdf"',
        }),
      );
      expect(mockCreateReadStream).toHaveBeenCalledWith('/tmp/resume.pdf');
      expect(stream.pipe).toHaveBeenCalledWith(res);
    });

    it('should force a download when requested', async () => {
      const user = { userId: 'user-1' };
      const res = { set: jest.fn() } as any;
      resumesService.preview.mockResolvedValue({
        previewId: 'resume-1',
        filename: 'resume.pdf',
      } as any);
      resumesService.getFilePath.mockResolvedValue('/tmp/resume.pdf');
      mockCreateReadStream.mockReturnValue({ pipe: jest.fn() } as any);

      await controller.preview('resume-1', '1', user, res);

      expect(res.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'Content-Disposition': 'attachment; filename="resume.pdf"',
        }),
      );
    });
  });
});
