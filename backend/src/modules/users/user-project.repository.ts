import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserProject } from './user-project.model';

@Injectable()
export class UserProjectRepository {
  constructor(
    @InjectModel(UserProject)
    private model: typeof UserProject,
  ) {}

  async create(values: Partial<UserProject>): Promise<UserProject> {
    return this.model.create(values as any);
  }

  async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<UserProject | null> {
    return this.model.findOne({ where: { id, userId }, raw: true });
  }

  async findAllByUserId(userId: string): Promise<UserProject[]> {
    return this.model.findAll({ where: { userId }, raw: true });
  }

  async update(
    id: string,
    userId: string,
    attrs: Partial<UserProject>,
  ): Promise<[number, UserProject[]]> {
    return this.model.update(attrs, {
      where: { id, userId },
      returning: true,
    });
  }

  async remove(id: string, userId: string): Promise<number> {
    return this.model.destroy({ where: { id, userId } });
  }
}
