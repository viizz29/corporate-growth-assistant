import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../users/user.model';

@Table({
  tableName: 'job_advertisements',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class JobAdvertisement extends Model {
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

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  title!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  requirements!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  location!: string | null;

  @Column({
    type: DataType.STRING(2),
    allowNull: false,
  })
  language!: string;
}
