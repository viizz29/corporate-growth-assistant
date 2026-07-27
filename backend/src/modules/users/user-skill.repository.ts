import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserSkill } from './user-skill.model';

@Injectable()
export class UserSkillRepository {
  constructor(
    @InjectModel(UserSkill)
    private model: typeof UserSkill,
  ) {}

  async create(values: Partial<UserSkill>): Promise<UserSkill> {
    return this.model.create(values as any);
  }

  async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<UserSkill | null> {
    return this.model.findOne({ where: { id, userId }, raw: true });
  }

  async findAllByUserId(userId: string): Promise<UserSkill[]> {
    return this.model.findAll({ where: { userId }, raw: true });
  }

  async update(
    id: string,
    userId: string,
    attrs: Partial<UserSkill>,
  ): Promise<[number, UserSkill[]]> {
    return this.model.update(attrs, {
      where: { id, userId },
      returning: true,
    });
  }

  async remove(id: string, userId: string): Promise<number> {
    return this.model.destroy({ where: { id, userId } });
  }
}
