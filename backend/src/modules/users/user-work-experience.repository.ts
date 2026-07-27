import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserWorkExperience } from './user-work-experience.model';

@Injectable()
export class UserWorkExperienceRepository {
  constructor(
    @InjectModel(UserWorkExperience)
    private model: typeof UserWorkExperience,
  ) {}

  async create(values: Partial<UserWorkExperience>): Promise<UserWorkExperience> {
    return this.model.create(values as any);
  }

  async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<UserWorkExperience | null> {
    return this.model.findOne({ where: { id, userId }, raw: true });
  }

  async findAllByUserId(userId: string): Promise<UserWorkExperience[]> {
    return this.model.findAll({ where: { userId }, raw: true });
  }

  async update(
    id: string,
    userId: string,
    attrs: Partial<UserWorkExperience>,
  ): Promise<[number, UserWorkExperience[]]> {
    return this.model.update(attrs, {
      where: { id, userId },
      returning: true,
    });
  }

  async remove(id: string, userId: string): Promise<number> {
    return this.model.destroy({ where: { id, userId } });
  }
}
