import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GeneratedResume } from './generated-resume.model';

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
    return this.model.findByPk(id, { raw: true });
  }
}
