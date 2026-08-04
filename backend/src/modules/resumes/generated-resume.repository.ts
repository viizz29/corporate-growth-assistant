import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GeneratedResume } from './generated-resume.model';
import { JobAdvertisement } from '../job-ads/job-advertisement.model';
import { ResumeTemplate } from './resume-template.model';

type GeneratedResumeRow = {
  id: string;
  userId: string;
  jobAdId: string;
  resumeTemplateId: string;
  atsScore: string | number;
  filePath: string;
  filename: string | null;
  generatedAt: Date | string;
  jobAdvertisement?: { title: string } | null;
  resumeTemplate?: { name: string } | null;
};

type PlainGeneratedResume = {
  id: string;
  userId: string;
  jobAdId: string;
  resumeTemplateId: string;
  atsScore: string | number;
  filePath: string;
  filename: string | null;
  generatedAt: Date | string;
  jobAdvertisement?: { title: string } | null;
  resumeTemplate?: { name: string } | null;
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

    console.log({ row });

    if (!row) {
      return null;
    }
    return this.mapRow(row as unknown as GeneratedResumeRow);
  }

  async findAllByUserId(userId: string): Promise<GeneratedResume[]> {
    const rows = await this.model.findAll({
      where: { userId },
      include: [
        {
          model: JobAdvertisement,
          attributes: ['title'],
          required: false,
        },
        {
          model: ResumeTemplate,
          attributes: ['name'],
          required: false,
        },
      ],
      order: [['generated_at', 'DESC']],
      nest: true,
      raw: false,
    });

    return rows.map((row) => {
      const plain = row.get({ plain: true }) as PlainGeneratedResume;
      return this.mapRow({
        id: plain.id,
        userId: plain.userId,
        jobAdId: plain.jobAdId,
        resumeTemplateId: plain.resumeTemplateId,
        atsScore: plain.atsScore,
        filePath: plain.filePath,
        filename: plain.filename,
        generatedAt: plain.generatedAt,
        jobAdvertisement: plain.jobAdvertisement
          ? { title: plain.jobAdvertisement.title }
          : null,
        resumeTemplate: plain.resumeTemplate
          ? { name: plain.resumeTemplate.name }
          : null,
      });
    });
  }

  private mapRow(row: GeneratedResumeRow): GeneratedResume {
    return {
      id: row.id,
      userId: row.userId,
      jobAdId: row.jobAdId,
      resumeTemplateId: row.resumeTemplateId,
      atsScore: Number(row.atsScore),
      filePath: row.filePath,
      filename: row.filename,
      generatedAt: new Date(row.generatedAt),
      jobAdvertisement: row.jobAdvertisement
        ? { title: row.jobAdvertisement.title }
        : undefined,
      resumeTemplate: row.resumeTemplate
        ? { name: row.resumeTemplate.name }
        : undefined,
    } as GeneratedResume;
  }
}
