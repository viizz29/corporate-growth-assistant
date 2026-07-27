import { Injectable, NotFoundException } from '@nestjs/common';
import { UserWorkExperienceRepository } from './user-work-experience.repository';
import { CreateUserWorkExperienceDto } from './dto/create-user-work-experience.dto';

@Injectable()
export class WorkExperienceService {
  constructor(
    private readonly workExperienceRepository: UserWorkExperienceRepository,
  ) {}

  async create(userId: string, dto: CreateUserWorkExperienceDto) {
    return this.workExperienceRepository.create({ userId, ...dto });
  }

  async findAllByUserId(userId: string) {
    return this.workExperienceRepository.findAllByUserId(userId);
  }

  async findByIdAndUserId(id: string, userId: string) {
    const entry = await this.workExperienceRepository.findByIdAndUserId(
      id,
      userId,
    );
    if (!entry) {
      throw new NotFoundException('Work experience entry not found');
    }
    return entry;
  }

  async update(
    id: string,
    userId: string,
    dto: Partial<CreateUserWorkExperienceDto>,
  ) {
    await this.findByIdAndUserId(id, userId);
    await this.workExperienceRepository.update(id, userId, dto);
    return this.workExperienceRepository.findByIdAndUserId(id, userId);
  }

  async remove(id: string, userId: string) {
    await this.findByIdAndUserId(id, userId);
    await this.workExperienceRepository.remove(id, userId);
    return { message: 'Work experience entry deleted successfully' };
  }
}
