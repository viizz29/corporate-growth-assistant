import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AtsScore } from './ats-score.model';

@Injectable()
export class AtsScoreRepository {
  constructor(
    @InjectModel(AtsScore)
    private model: typeof AtsScore,
  ) {}

  async create(values: Partial<AtsScore>): Promise<AtsScore> {
    return this.model.create(values as any);
  }

  async findByUserAndJobAd(
    userId: string,
    jobAdId: string,
  ): Promise<AtsScore | null> {
    return this.model.findOne({ where: { userId, jobAdId }, raw: true });
  }

  async upsert(
    userId: string,
    jobAdId: string,
    attrs: Partial<AtsScore>,
  ): Promise<AtsScore> {
    const existing = await this.findByUserAndJobAd(userId, jobAdId);
    if (existing) {
      await this.model.update(attrs, { where: { userId, jobAdId } });
      return this.findByUserAndJobAd(userId, jobAdId) as Promise<AtsScore>;
    }
    return this.create({ userId, jobAdId, ...attrs });
  }
}
