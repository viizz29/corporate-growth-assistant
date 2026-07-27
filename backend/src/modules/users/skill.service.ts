import { Injectable, NotFoundException } from '@nestjs/common';
import { UserSkillRepository } from './user-skill.repository';
import { CreateUserSkillDto } from './dto/create-user-skill.dto';

@Injectable()
export class SkillService {
  constructor(private readonly skillRepository: UserSkillRepository) {}

  async create(userId: string, dto: CreateUserSkillDto) {
    return this.skillRepository.create({ userId, ...dto });
  }

  async findAllByUserId(userId: string) {
    return this.skillRepository.findAllByUserId(userId);
  }

  async findByIdAndUserId(id: string, userId: string) {
    const skill = await this.skillRepository.findByIdAndUserId(id, userId);
    if (!skill) {
      throw new NotFoundException('Skill entry not found');
    }
    return skill;
  }

  async update(id: string, userId: string, dto: Partial<CreateUserSkillDto>) {
    await this.findByIdAndUserId(id, userId);
    await this.skillRepository.update(id, userId, dto);
    return this.skillRepository.findByIdAndUserId(id, userId);
  }

  async remove(id: string, userId: string) {
    await this.findByIdAndUserId(id, userId);
    await this.skillRepository.remove(id, userId);
    return { message: 'Skill entry deleted successfully' };
  }
}
