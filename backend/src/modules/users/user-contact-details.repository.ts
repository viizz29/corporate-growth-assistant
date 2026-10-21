import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserContactDetail } from './user-contact-details.model';

@Injectable()
export class UserContactDetailsRepository {
  constructor(
    @InjectModel(UserContactDetail)
    private model: typeof UserContactDetail,
  ) {}

  async create(values: Partial<UserContactDetail>): Promise<UserContactDetail> {
    return this.model.create(values as any);
  }

  async findByUserId(userId: string): Promise<UserContactDetail | null> {
    return this.model.findOne({ where: { userId }, raw: true });
  }

  async update(
    userId: string,
    attrs: Partial<UserContactDetail>,
  ): Promise<[number, UserContactDetail[]]> {
    return this.model.update(attrs, {
      where: { userId },
      returning: true,
    });
  }
}
