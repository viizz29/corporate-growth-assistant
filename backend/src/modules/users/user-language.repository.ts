import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserLanguage } from './user-language.model';

@Injectable()
export class UserLanguageRepository {
  constructor(
    @InjectModel(UserLanguage)
    private readonly languageModel: typeof UserLanguage,
  ) {}

  async findById(id: string): Promise<UserLanguage | null> {
    return this.languageModel.findByPk(id);
  }

  async findByUserId(userId: string): Promise<UserLanguage[]> {
    return this.languageModel.findAll({
      where: { userId },
      order: [['created_at', 'ASC']],
      raw: true,
    });
  }

  async create(data: {
    userId: string;
    languageName: string;
    proficiencyLevel?: string | null;
  }): Promise<UserLanguage> {
    return this.languageModel.create({
      userId: data.userId,
      languageName: data.languageName,
      proficiencyLevel: data.proficiencyLevel ?? null,
    });
  }

  async update(
    id: string,
    data: Partial<{
      languageName: string;
      proficiencyLevel: string | null;
    }>,
  ): Promise<[number, UserLanguage[]]> {
    return this.languageModel.update(data, {
      where: { id },
      returning: true,
    });
  }

  async delete(id: string): Promise<number> {
    return this.languageModel.destroy({ where: { id } });
  }
}
