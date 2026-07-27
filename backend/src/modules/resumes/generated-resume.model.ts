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
import { ResumeTemplate } from './resume-template.model';

@Table({
  tableName: 'generated_resumes',
  timestamps: false,
})
export class GeneratedResume extends Model {
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

  @ForeignKey(() => ResumeTemplate)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'resume_template_id',
  })
  resumeTemplateId!: string;

  @BelongsTo(() => ResumeTemplate)
  resumeTemplate!: ResumeTemplate;

  @Column({
    type: DataType.DECIMAL(5, 2),
    allowNull: false,
    field: 'ats_score',
  })
  atsScore!: number;

  @Column({
    type: DataType.STRING(512),
    allowNull: false,
    field: 'file_path',
  })
  filePath!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'generated_at',
  })
  generatedAt!: Date;
}
