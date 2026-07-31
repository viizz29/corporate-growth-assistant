import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { EducationService } from './education.service';
import { WorkExperienceService } from './work-experience.service';
import { SkillService } from './skill.service';
import { ProjectService } from './project.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;
  let educationService: jest.Mocked<EducationService>;
  let workExperienceService: jest.Mocked<WorkExperienceService>;
  let skillService: jest.Mocked<SkillService>;
  let projectService: jest.Mocked<ProjectService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
            getEmailPreferences: jest.fn(),
            updateEmailPreferences: jest.fn(),
          },
        },
        {
          provide: EducationService,
          useValue: {
            findAllByUserId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: WorkExperienceService,
          useValue: {
            findAllByUserId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: SkillService,
          useValue: {
            findAllByUserId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: ProjectService,
          useValue: {
            findAllByUserId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
    educationService = module.get(EducationService);
    workExperienceService = module.get(WorkExperienceService);
    skillService = module.get(SkillService);
    projectService = module.get(ProjectService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile by userId', async () => {
      const user = { userId: 'user-123' };
      const expected = {
        userId: 'user-123',
        name: 'John',
        email: 'john@test.com',
      };
      usersService.findById.mockResolvedValue(expected as any);

      const result = await controller.getProfile(user);

      expect(usersService.findById).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(expected);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const user = { userId: 'user-123' };
      const dto = { name: 'Jane', email: 'jane@test.com' };
      const expected = {
        userId: 'user-123',
        name: 'Jane',
        email: 'jane@test.com',
      };
      usersService.update.mockResolvedValue(expected as any);

      const result = await controller.updateProfile(dto, user);

      expect(usersService.update).toHaveBeenCalledWith('user-123', dto);
      expect(result).toEqual(expected);
    });
  });

  describe('getEducations', () => {
    it('should return the authenticated user education list', async () => {
      const user = { userId: 'user-123' };
      const expected = [
        {
          id: 'education-123',
          institution: 'MIT',
          degree: 'BSc',
          fieldOfStudy: 'Computer Science',
          startDate: '2018-08-01',
          endDate: '2022-05-31',
          description: 'Studied algorithms',
        },
      ];
      educationService.findAllByUserId.mockResolvedValue(expected as any);

      const result = await controller.getEducations(user);

      expect(educationService.findAllByUserId).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(expected);
    });
  });

  describe('getEmailPreferences', () => {
    it('should return email preferences', async () => {
      const user = { userId: 'user-123' };
      const expected = { emailNotifications: true };
      usersService.getEmailPreferences.mockResolvedValue(expected);

      const result = await controller.getEmailPreferences(user);

      expect(usersService.getEmailPreferences).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(expected);
    });
  });

  describe('getWorkExperiences', () => {
    it('should return the authenticated user work experience list', async () => {
      const user = { userId: 'user-123' };
      const expected = [
        {
          id: 'work-experience-123',
          company: 'Acme Corp',
          role: 'Software Engineer',
          startDate: '2021-01-15',
          endDate: '2024-06-30',
          description: 'Built REST APIs and microservices.',
        },
      ];
      workExperienceService.findAllByUserId.mockResolvedValue(expected as any);

      const result = await controller.getWorkExperiences(user);

      expect(workExperienceService.findAllByUserId).toHaveBeenCalledWith(
        'user-123',
      );
      expect(result).toEqual(expected);
    });
  });

  describe('getSkills', () => {
    it('should return the authenticated user skill list', async () => {
      const user = { userId: 'user-123' };
      const expected = [
        {
          id: 'skill-123',
          skillName: 'TypeScript',
          proficiencyLevel: 'advanced',
        },
      ];
      skillService.findAllByUserId.mockResolvedValue(expected as any);

      const result = await controller.getSkills(user);

      expect(skillService.findAllByUserId).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(expected);
    });
  });

  describe('getProjects', () => {
    it('should return the authenticated user project list', async () => {
      const user = { userId: 'user-123' };
      const expected = [
        {
          id: 'project-123',
          projectName: 'Portfolio Website',
          description: 'A personal portfolio built with React and Node.js.',
          startDate: '2023-01-01',
          endDate: '2023-06-30',
          techStack: 'React, Node.js, PostgreSQL',
        },
      ];
      projectService.findAllByUserId.mockResolvedValue(expected as any);

      const result = await controller.getProjects(user);

      expect(projectService.findAllByUserId).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(expected);
    });
  });

  describe('updateEmailPreferences', () => {
    it('should update email preferences', async () => {
      const user = { userId: 'user-123' };
      const dto = { emailNotifications: false };
      const expected = { emailNotifications: false };
      usersService.updateEmailPreferences.mockResolvedValue(expected);

      const result = await controller.updateEmailPreferences(dto, user);

      expect(usersService.updateEmailPreferences).toHaveBeenCalledWith(
        'user-123',
        dto,
      );
      expect(result).toEqual(expected);
    });
  });
});
