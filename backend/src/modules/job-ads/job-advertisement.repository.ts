import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JobAdvertisement } from './job-advertisement.model';

@Injectable()
export class JobAdvertisementRepository {
  constructor(
    @InjectModel(JobAdvertisement)
    private model: typeof JobAdvertisement,
  ) {}

  async create(values: Partial<JobAdvertisement>): Promise<JobAdvertisement> {
    return this.model.create(values as any);
  }

  async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<JobAdvertisement | null> {
    return this.model.findOne({ where: { id, userId }, raw: true });
  }

  async findAllByUserId(userId: string): Promise<JobAdvertisement[]> {
    return this.model.findAll({ where: { userId }, raw: true });
  }

  async update(
    id: string,
    userId: string,
    attrs: Partial<JobAdvertisement>,
  ): Promise<[number, JobAdvertisement[]]> {
    return this.model.update(attrs, {
      where: { id, userId },
      returning: true,
    });
  }

  async remove(id: string, userId: string): Promise<number> {
    return this.model.destroy({ where: { id, userId } });
  }
}
