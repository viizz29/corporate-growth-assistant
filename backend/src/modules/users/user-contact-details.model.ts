import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './user.model';

export enum UserGender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHERS = 'Others',
}

@Table({
  tableName: 'user_contact_details',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class UserContactDetail extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
  })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  email!: string | null;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  phone!: string | null;

  @Column({
    type: DataType.ENUM(...Object.values(UserGender)),
    allowNull: true,
  })
  gender!: string | null;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  githubUrl!: string | null;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  linkedinUrl!: string | null;
}
