import { Injectable, NotFoundException } from '@nestjs/common';
import { UserEducationRepository } from './user-education.repository';
import { CreateUserEducationDto } from './dto/create-user-education.dto';

@Injectable()
export class EducationService {
  constructor(private readonly educationRepository: UserEducationRepository) {}

  async create(userId: string, dto: CreateUserEducationDto) {
    return this.educationRepository.create({ userId, ...dto });
  }

  async findAllByUserId(userId: string) {
    return this.educationRepository.findAllByUserId(userId);
  }

  async findByIdAndUserId(id: string, userId: string) {
    const education = await this.educationRepository.findByIdAndUserId(
      id,
      userId,
    );
    if (!education) {
      throw new NotFoundException('Education entry not found');
    }
    return education;
  }

  async update(
    id: string,
    userId: string,
    dto: Partial<CreateUserEducationDto>,
  ) {
    await this.findByIdAndUserId(id, userId);
    await this.educationRepository.update(id, userId, dto);
    return this.educationRepository.findByIdAndUserId(id, userId);
  }

  async remove(id: string, userId: string) {
    await this.findByIdAndUserId(id, userId);
    await this.educationRepository.remove(id, userId);
    return { message: 'Education entry deleted successfully' };
  }
}
