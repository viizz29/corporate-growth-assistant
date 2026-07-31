import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AtsScore } from './ats-score.model';

type AtsScoreRow = {
  id: string;
  user_id: string;
  job_ad_id: string;
  ats_score: string | number;
  recommendations: AtsScore['recommendations'];
  ai_feedback: AtsScore['aiFeedback'];
  created_at: Date | string;
  updated_at: Date | string;
};

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
    raw: boolean = true,
  ): Promise<Partial<AtsScore> | null> {
    const row = await this.model.findOne({
      where: { userId, jobAdId },
      raw,
    });

    return row;
  }

  async upsert(
    userId: string,
    jobAdId: string,
    attrs: Partial<AtsScore>,
  ): Promise<Partial<AtsScore> | AtsScore> {
    const existing = await this.findByUserAndJobAd(userId, jobAdId);
    if (existing) {
      await this.model.update(attrs, { where: { userId, jobAdId } });
      return this.findByUserAndJobAd(userId, jobAdId) as Promise<
        Partial<AtsScore>
      >;
    }
    return this.create({ userId, jobAdId, ...attrs });
  }

  private mapRow(row: AtsScoreRow): Partial<AtsScore> {
    return {
      id: row.id,
      userId: row.user_id,
      jobAdId: row.job_ad_id,
      atsScore: Number(row.ats_score),
      recommendations: row.recommendations,
      aiFeedback: row.ai_feedback,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
