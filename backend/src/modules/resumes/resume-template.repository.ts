import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ResumeTemplate } from './resume-template.model';

@Injectable()
export class ResumeTemplateRepository {
  constructor(
    @InjectModel(ResumeTemplate)
    private model: typeof ResumeTemplate,
  ) {}

  async findActiveByLanguage(language: string): Promise<ResumeTemplate[]> {
    return this.model.findAll({
      where: { language, isActive: true },
      raw: true,
    });
  }

  async findById(id: string): Promise<ResumeTemplate | null> {
    return this.model.findByPk(id, { raw: true });
  }
}
