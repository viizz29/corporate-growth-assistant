import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ResumeTemplate } from './resume-template.model';

type ResumeTemplateRow = {
  id: string;
  name: string;
  language: string;
  isActive: boolean;
  created_at: Date | string;
  updated_at: Date | string;
};

@Injectable()
export class ResumeTemplateRepository {
  constructor(
    @InjectModel(ResumeTemplate)
    private model: typeof ResumeTemplate,
  ) {}

  async findActiveByLanguage(language: string): Promise<ResumeTemplate[]> {
    const rows = await this.model.findAll({
      where: { language, isActive: true },
      raw: true,
    });
    return (rows as unknown as ResumeTemplateRow[]).map((row) =>
      this.mapRow(row),
    ) as unknown as ResumeTemplate[];
  }

  async findById(
    id: string,
    raw: boolean = true,
  ): Promise<ResumeTemplate | null> {
    const row = await this.model.findByPk(id, { raw });
    if (!row) {
      return null;
    }

    return this.mapRow(
      row as unknown as ResumeTemplateRow,
    ) as unknown as ResumeTemplate;
  }

  private mapRow(row: ResumeTemplateRow): Partial<ResumeTemplate> {
    return {
      id: row.id,
      name: row.name,
      language: row.language,
      isActive: row.isActive,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
