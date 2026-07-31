import { Controller, Get, Post, Put, Patch, Delete, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { EducationService } from './education.service';
import { WorkExperienceService } from './work-experience.service';
import { SkillService } from './skill.service';
import { ProjectService } from './project.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SkipEmailVerification } from '../../common/decorators/public.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateEmailPreferencesDto } from './dto/update-email-preferences.dto';
import { CreateUserEducationDto } from './dto/create-user-education.dto';
import { UpdateUserEducationDto } from './dto/update-user-education.dto';
import { CreateUserWorkExperienceDto } from './dto/create-user-work-experience.dto';
import { UpdateUserWorkExperienceDto } from './dto/update-user-work-experience.dto';
import { CreateUserSkillDto } from './dto/create-user-skill.dto';
import { UpdateUserSkillDto } from './dto/update-user-skill.dto';
import { CreateUserProjectDto } from './dto/create-user-project.dto';
import { UpdateUserProjectDto } from './dto/update-user-project.dto';
import { UserEducationResponseDto } from './dto/user-education-response.dto';
import { UserWorkExperienceResponseDto } from './dto/user-work-experience-response.dto';
import { UserSkillResponseDto } from './dto/user-skill-response.dto';
import { UserProjectResponseDto } from './dto/user-project-response.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('users')
@Controller('v1/users')
@ApiBearerAuth('bearerAuth')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private educationService: EducationService,
    private workExperienceService: WorkExperienceService,
    private skillService: SkillService,
    private projectService: ProjectService,
  ) {}
  // @Get()
  // findAll() {
  //   return this.usersService.findAll();
  // }

  @SkipEmailVerification()
  @Get('me')
  getProfile(@CurrentUser() user: { userId: string }) {
    return this.usersService.findById(user.userId);
  }

  @SkipEmailVerification()
  @Patch('me')
  @ApiOperation({
    summary: 'Update profile (name, email, language, and/or theme)',
  })
  updateProfile(
    @Body() dto: UpdateProfileDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.usersService.update(user.userId, dto);
  }

  @SkipEmailVerification()
  @Get('educations')
  @ApiOperation({ summary: 'Get the authenticated user education list' })
  @ApiResponse({
    status: 200,
    description: 'Returns the authenticated user education entries.',
    type: UserEducationResponseDto,
    isArray: true,
  })
  getEducations(@CurrentUser() user: { userId: string }) {
    return this.educationService.findAllByUserId(user.userId);
  }

  @SkipEmailVerification()
  @Post('educations')
  @ApiOperation({ summary: 'Add a new education entry' })
  @ApiBody({ type: CreateUserEducationDto })
  @ApiResponse({ status: 201, description: 'Education entry created.' })
  createEducation(
    @Body() dto: CreateUserEducationDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.educationService.create(user.userId, dto);
  }

  @SkipEmailVerification()
  @Patch('educations/:id')
  @ApiOperation({ summary: 'Update an education entry' })
  @ApiBody({ type: UpdateUserEducationDto })
  @ApiResponse({ status: 200, description: 'Education entry updated.' })
  @ApiResponse({ status: 404, description: 'Education entry not found.' })
  updateEducation(
    @Param('id') id: string,
    @Body() dto: UpdateUserEducationDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.educationService.update(id, user.userId, dto);
  }

  @SkipEmailVerification()
  @Delete('educations/:id')
  @ApiOperation({ summary: 'Delete an education entry' })
  @ApiResponse({ status: 200, description: 'Education entry deleted.' })
  @ApiResponse({ status: 404, description: 'Education entry not found.' })
  deleteEducation(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.educationService.remove(id, user.userId);
  }

  @SkipEmailVerification()
  @Post('work-experiences')
  @ApiOperation({ summary: 'Add a new work experience entry' })
  @ApiBody({ type: CreateUserWorkExperienceDto })
  @ApiResponse({ status: 201, description: 'Work experience entry created.' })
  createWorkExperience(
    @Body() dto: CreateUserWorkExperienceDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.workExperienceService.create(user.userId, dto);
  }

  @SkipEmailVerification()
  @Get('work-experiences')
  @ApiOperation({ summary: 'Get the authenticated user work experience list' })
  @ApiResponse({
    status: 200,
    description: 'Returns the authenticated user work experience entries.',
    type: UserWorkExperienceResponseDto,
    isArray: true,
  })
  getWorkExperiences(@CurrentUser() user: { userId: string }) {
    return this.workExperienceService.findAllByUserId(user.userId);
  }

  @SkipEmailVerification()
  @Patch('work-experiences/:id')
  @ApiOperation({ summary: 'Update a work experience entry' })
  @ApiBody({ type: UpdateUserWorkExperienceDto })
  @ApiResponse({ status: 200, description: 'Work experience entry updated.' })
  @ApiResponse({ status: 404, description: 'Work experience entry not found.' })
  updateWorkExperience(
    @Param('id') id: string,
    @Body() dto: UpdateUserWorkExperienceDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.workExperienceService.update(id, user.userId, dto);
  }

  @SkipEmailVerification()
  @Delete('work-experiences/:id')
  @ApiOperation({ summary: 'Delete a work experience entry' })
  @ApiResponse({ status: 200, description: 'Work experience entry deleted.' })
  @ApiResponse({ status: 404, description: 'Work experience entry not found.' })
  deleteWorkExperience(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.workExperienceService.remove(id, user.userId);
  }

  @SkipEmailVerification()
  @Post('skills')
  @ApiOperation({ summary: 'Add a new skill entry' })
  @ApiBody({ type: CreateUserSkillDto })
  @ApiResponse({ status: 201, description: 'Skill entry created.' })
  createSkill(
    @Body() dto: CreateUserSkillDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.skillService.create(user.userId, dto);
  }

  @SkipEmailVerification()
  @Get('skills')
  @ApiOperation({ summary: 'Get the authenticated user skill list' })
  @ApiResponse({
    status: 200,
    description: 'Returns the authenticated user skill entries.',
    type: UserSkillResponseDto,
    isArray: true,
  })
  getSkills(@CurrentUser() user: { userId: string }) {
    return this.skillService.findAllByUserId(user.userId);
  }

  @SkipEmailVerification()
  @Patch('skills/:id')
  @ApiOperation({ summary: 'Update a skill entry' })
  @ApiBody({ type: UpdateUserSkillDto })
  @ApiResponse({ status: 200, description: 'Skill entry updated.' })
  @ApiResponse({ status: 404, description: 'Skill entry not found.' })
  updateSkill(
    @Param('id') id: string,
    @Body() dto: UpdateUserSkillDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.skillService.update(id, user.userId, dto);
  }

  @SkipEmailVerification()
  @Delete('skills/:id')
  @ApiOperation({ summary: 'Delete a skill entry' })
  @ApiResponse({ status: 200, description: 'Skill entry deleted.' })
  @ApiResponse({ status: 404, description: 'Skill entry not found.' })
  deleteSkill(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.skillService.remove(id, user.userId);
  }

  @SkipEmailVerification()
  @Post('projects')
  @ApiOperation({ summary: 'Add a new project entry' })
  @ApiBody({ type: CreateUserProjectDto })
  @ApiResponse({ status: 201, description: 'Project entry created.' })
  createProject(
    @Body() dto: CreateUserProjectDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.projectService.create(user.userId, dto);
  }

  @SkipEmailVerification()
  @Get('projects')
  @ApiOperation({ summary: 'Get the authenticated user project list' })
  @ApiResponse({
    status: 200,
    description: 'Returns the authenticated user project entries.',
    type: UserProjectResponseDto,
    isArray: true,
  })
  getProjects(@CurrentUser() user: { userId: string }) {
    return this.projectService.findAllByUserId(user.userId);
  }

  @SkipEmailVerification()
  @Patch('projects/:id')
  @ApiOperation({ summary: 'Update a project entry' })
  @ApiBody({ type: UpdateUserProjectDto })
  @ApiResponse({ status: 200, description: 'Project entry updated.' })
  @ApiResponse({ status: 404, description: 'Project entry not found.' })
  updateProject(
    @Param('id') id: string,
    @Body() dto: UpdateUserProjectDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.projectService.update(id, user.userId, dto);
  }

  @SkipEmailVerification()
  @Delete('projects/:id')
  @ApiOperation({ summary: 'Delete a project entry' })
  @ApiResponse({ status: 200, description: 'Project entry deleted.' })
  @ApiResponse({ status: 404, description: 'Project entry not found.' })
  deleteProject(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.projectService.remove(id, user.userId);
  }

  @SkipEmailVerification()
  @Get('me/email-preferences')
  @ApiOperation({ summary: 'Get email notification preferences' })
  @ApiResponse({
    status: 200,
    description: 'Returns email notification preference',
  })
  getEmailPreferences(@CurrentUser() user: { userId: string }) {
    return this.usersService.getEmailPreferences(user.userId);
  }

  @SkipEmailVerification()
  @Put('me/email-preferences')
  @ApiOperation({ summary: 'Update email notification preferences' })
  @ApiResponse({ status: 200, description: 'Email preferences updated' })
  updateEmailPreferences(
    @Body() dto: UpdateEmailPreferencesDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.usersService.updateEmailPreferences(user.userId, dto);
  }
}
