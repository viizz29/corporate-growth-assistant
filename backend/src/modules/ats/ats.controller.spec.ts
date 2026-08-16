import { Test, TestingModule } from '@nestjs/testing';
import { AtsController } from './ats.controller';
import { AtsService } from './ats.service';

describe('AtsController', () => {
  let controller: AtsController;
  let atsService: jest.Mocked<AtsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AtsController],
      providers: [
        {
          provide: AtsService,
          useValue: {
            compute: jest.fn(),
            listForUser: jest.fn(),
            findByUserAndJobAd: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(AtsController);
    atsService = module.get(AtsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('computeScore', () => {
    it('should compute an ATS score for the authenticated user', async () => {
      const user = { userId: 'user-1' };
      const dto = { jobAdId: 'job-ad-1' };
      const expected = { userId: 'user-1', jobAdId: 'job-ad-1', atsScore: 80 };
      atsService.compute.mockResolvedValue(expected as any);

      const result = await controller.computeScore(dto, user);

      expect(atsService.compute).toHaveBeenCalledWith('user-1', 'job-ad-1');
      expect(result).toEqual(expected);
    });
  });

  describe('listScores', () => {
    it('should list cached ATS scores for the authenticated user', async () => {
      const user = { userId: 'user-1' };
      const expected = [{ jobAdId: 'job-ad-1', atsScore: 80 }];
      atsService.listForUser.mockResolvedValue(expected as any);

      const result = await controller.listScores(user);

      expect(atsService.listForUser).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(expected);
    });
  });

  describe('getScore', () => {
    it('should return the cached score for a job advertisement', async () => {
      const user = { userId: 'user-1' };
      const expected = { jobAdId: 'job-ad-1', atsScore: 80 };
      atsService.findByUserAndJobAd.mockResolvedValue(expected as any);

      const result = await controller.getScore('job-ad-1', user);

      expect(atsService.findByUserAndJobAd).toHaveBeenCalledWith(
        'user-1',
        'job-ad-1',
      );
      expect(result).toEqual(expected);
    });
  });
});
