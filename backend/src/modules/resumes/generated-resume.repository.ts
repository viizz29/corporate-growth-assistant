import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GeneratedResume } from './generated-resume.model';

type GeneratedResumeRow = {
  id: string;
  user_id: string;
  job_ad_id: string;
  resume_template_id: string;
  ats_score: string | number;
  file_path: string;
  generated_at: Date | string;
};

@Injectable()
export class GeneratedResumeRepository {
  constructor(
    @InjectModel(GeneratedResume)
    private model: typeof GeneratedResume,
  ) {}

  async create(values: Partial<GeneratedResume>): Promise<GeneratedResume> {
    return this.model.create(values as any);
  }

  async findById(id: string): Promise<GeneratedResume | null> {
    const row = await this.model.findByPk(id, { raw: true });
    if (!row) {
      return null;
    }
    return this.mapRow(row as unknown as GeneratedResumeRow) as GeneratedResume;
  }

  private mapRow(row: GeneratedResumeRow): GeneratedResume {
    return {
      id: row.id,
      userId: row.user_id,
      jobAdId: row.job_ad_id,
      resumeTemplateId: row.resume_template_id,
      atsScore: Number(row.ats_score),
      filePath: row.file_path,
      generatedAt: new Date(row.generated_at),
    } as GeneratedResume;
  }
}
