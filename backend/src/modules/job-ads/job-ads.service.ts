import { Injectable, NotFoundException } from '@nestjs/common';
import { JobAdvertisementRepository } from './job-advertisement.repository';
import { CreateJobAdDto } from './dto/create-job-ad.dto';

@Injectable()
export class JobAdsService {
  constructor(
    private readonly jobAdRepository: JobAdvertisementRepository,
  ) {}

  async create(userId: string, dto: CreateJobAdDto) {
    return this.jobAdRepository.create({ userId, ...dto });
  }

  async findAllByUserId(userId: string) {
    return this.jobAdRepository.findAllByUserId(userId);
  }

  async findByIdAndUserId(id: string, userId: string) {
    const jobAd = await this.jobAdRepository.findByIdAndUserId(id, userId);
    if (!jobAd) {
      throw new NotFoundException('Job advertisement not found');
    }
    return jobAd;
  }

  async update(id: string, userId: string, dto: Partial<CreateJobAdDto>) {
    await this.findByIdAndUserId(id, userId);
    await this.jobAdRepository.update(id, userId, dto);
    return this.jobAdRepository.findByIdAndUserId(id, userId);
  }

  async remove(id: string, userId: string) {
    await this.findByIdAndUserId(id, userId);
    await this.jobAdRepository.remove(id, userId);
    return { message: 'Job advertisement deleted successfully' };
  }
}
