import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserEducation } from './user-education.model';

@Injectable()
export class UserEducationRepository {
  constructor(
    @InjectModel(UserEducation)
    private model: typeof UserEducation,
  ) {}

  async create(values: Partial<UserEducation>): Promise<UserEducation> {
    return this.model.create(values as any);
  }

  async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<UserEducation | null> {
    return this.model.findOne({ where: { id, userId }, raw: true });
  }

  async findAllByUserId(userId: string): Promise<UserEducation[]> {
    return this.model.findAll({ where: { userId }, raw: true });
  }

  async update(
    id: string,
    userId: string,
    attrs: Partial<UserEducation>,
  ): Promise<[number, UserEducation[]]> {
    return this.model.update(attrs, {
      where: { id, userId },
      returning: true,
    });
  }

  async remove(id: string, userId: string): Promise<number> {
    return this.model.destroy({ where: { id, userId } });
  }
}
