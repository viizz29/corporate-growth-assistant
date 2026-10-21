import { Injectable } from '@nestjs/common';
import { UserContactDetailsRepository } from './user-contact-details.repository';
import { UpdateContactDetailsDto } from './dto/update-contact-details.dto';

@Injectable()
export class ContactDetailService {
  constructor(
    private readonly contactDetailRepo: UserContactDetailsRepository,
  ) {}

  async findByUserId(userId: string) {
    const detail = await this.contactDetailRepo.findByUserId(userId);
    if (!detail) {
      // throw new NotFoundException('Contact Detail entry not found');
      return {};
    }
    return detail;
  }

  async update(userId: string, dto: Partial<UpdateContactDetailsDto>) {
    const contactDetail = await this.contactDetailRepo.findByUserId(userId);

    if (contactDetail) {
      await this.contactDetailRepo.update(userId, dto);
    } else {
      await this.contactDetailRepo.create({
        ...dto,
        userId,
      });
    }

    return await this.contactDetailRepo.findByUserId(userId);
  }
}
