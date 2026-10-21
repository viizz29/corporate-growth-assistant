import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user.model';
import { UserRepository } from './users.repository';
import { UserEducation } from './user-education.model';
import { UserEducationRepository } from './user-education.repository';
import { EducationService } from './education.service';
import { UserWorkExperience } from './user-work-experience.model';
import { UserWorkExperienceRepository } from './user-work-experience.repository';
import { WorkExperienceService } from './work-experience.service';
import { UserSkill } from './user-skill.model';
import { UserSkillRepository } from './user-skill.repository';
import { SkillService } from './skill.service';
import { UserProject } from './user-project.model';
import { UserProjectRepository } from './user-project.repository';
import { ProjectService } from './project.service';
import { UserLanguage } from './user-language.model';
import { UserLanguageRepository } from './user-language.repository';
import { LanguageService } from './language.service';
import { ContactDetailService } from './contact-detail.service';
import { UserContactDetail } from './user-contact-details.model';
import { UserContactDetailsRepository } from './user-contact-details.repository';

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      UserContactDetail,
      UserEducation,
      UserWorkExperience,
      UserSkill,
      UserProject,
      UserLanguage,
    ]),
  ],
  providers: [
    UsersService,
    UserRepository,
    UserContactDetailsRepository,
    ContactDetailService,
    UserEducationRepository,
    EducationService,
    UserWorkExperienceRepository,
    WorkExperienceService,
    UserSkillRepository,
    SkillService,
    UserProjectRepository,
    ProjectService,
    UserLanguageRepository,
    LanguageService,
  ],
  controllers: [UsersController],
  exports: [
    UserRepository,
    UserContactDetailsRepository,
    UserEducationRepository,
    UserWorkExperienceRepository,
    UserSkillRepository,
    UserProjectRepository,
    UserLanguageRepository,
  ],
})
export class UsersModule {}
