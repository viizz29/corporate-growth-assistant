import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UserLanguageRepository } from './user-language.repository';
import type { CreateUserLanguageDto } from './dto/create-user-language.dto';
import type { UpdateUserLanguageDto } from './dto/update-user-language.dto';

@Injectable()
export class LanguageService {
  constructor(
    private readonly languageRepository: UserLanguageRepository,
  ) {}

  async findAllByUser(userId: string) {
    return this.languageRepository.findByUserId(userId);
  }

  async create(userId: string, dto: CreateUserLanguageDto) {
    try {
      const language = await this.languageRepository.create({
        userId,
        languageName: dto.languageName,
        proficiencyLevel: dto.proficiencyLevel ?? null,
      });
      return language;
    } catch (error: any) {
      throw error;
    }
  }

  async update(userId: string, id: string, dto: UpdateUserLanguageDto) {
    const existing = await this.languageRepository.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundException('Language not found');
    }

    const [affectedCount, updated] = await this.languageRepository.update(id, {
      languageName: dto.languageName,
      proficiencyLevel: dto.proficiencyLevel,
    });

    if (affectedCount === 0) {
      throw new NotFoundException('Language not found');
    }

    return updated[0];
  }

  async remove(userId: string, id: string) {
    const existing = await this.languageRepository.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundException('Language not found');
    }

    await this.languageRepository.delete(id);
  }
}