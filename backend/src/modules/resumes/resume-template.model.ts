import { Column, Model, Table, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'resume_templates',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class ResumeTemplate extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
  })
  declare id: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING(2),
    allowNull: false,
  })
  language!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_active',
  })
  isActive!: boolean;
}
