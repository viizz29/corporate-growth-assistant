import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from './users.repository';
import { User } from './user.model';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateEmailPreferencesDto } from './dto/update-email-preferences.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  async findOneByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async findAll() {
    return this.userRepository.findAll();
  }

  async findById(userId: string) {
    const user = await this.userRepository.findById(userId, false);
    if (!user) return null;
    const { passwordHash: _, ...rest } = user.get({ plain: true }) as User;
    return rest;
  }

  async update(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email) {
      const existing = await this.userRepository.findByEmail(dto.email);
      if (existing && existing.get('userId') !== userId) {
        throw new ConflictException('Email already in use');
      }
    }

    await this.userRepository.update(userId, dto);
    return this.findById(userId);
  }

  async getEmailPreferences(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { emailNotifications: user.isEmailNotificationsEnabled };
  }

  async updateEmailPreferences(userId: string, dto: UpdateEmailPreferencesDto) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.update(userId, {
      isEmailNotificationsEnabled: dto.emailNotifications,
    } as Partial<User>);

    return { emailNotifications: dto.emailNotifications };
  }

  async onModuleInit() {
    if (this.configService.get<string>('NODE_ENV') === 'production') {
      return;
    }
    await this.seedTestUser();
  }

  private async seedTestUser() {
    const testEmail = 'test@gmail.com';
    const existingUser = await this.userRepository.findByEmail(testEmail);

    if (!existingUser) {
      const bcryptRounds = this.configService.get<number>('BCRYPT_ROUNDS', 12);
      const hashedPassword = await bcrypt.hash('password123', bcryptRounds);

      await this.userRepository.create({
        email: testEmail,
        passwordHash: hashedPassword,
        name: 'Test',
        isEmailVerified: true,
      });
    }
  }
}
