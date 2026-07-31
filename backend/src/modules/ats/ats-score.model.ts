import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../users/user.model';
import { JobAdvertisement } from '../job-ads/job-advertisement.model';
import type { AtsAiFeedback } from '../../lib/openai.service';

@Table({
  tableName: 'ats_scores',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class AtsScore extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => JobAdvertisement)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'job_ad_id',
  })
  jobAdId!: string;

  @BelongsTo(() => JobAdvertisement)
  jobAdvertisement!: JobAdvertisement;

  @Column({
    type: DataType.DECIMAL(5, 2),
    allowNull: false,
    field: 'ats_score',
  })
  atsScore!: number;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  recommendations!: Array<{ type: string; message: string }> | null;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    field: 'ai_feedback',
  })
  aiFeedback!: AtsAiFeedback | null;
}
