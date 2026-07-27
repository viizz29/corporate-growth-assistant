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
  tableName: 'user_work_experiences',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class UserWorkExperience extends Model {
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
  company!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  role!: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
    field: 'start_date',
  })
  startDate!: string | null;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
    field: 'end_date',
  })
  endDate!: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description!: string | null;
}
