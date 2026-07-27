import { Injectable, NotFoundException } from '@nestjs/common';
import { UserProjectRepository } from './user-project.repository';
import { CreateUserProjectDto } from './dto/create-user-project.dto';

@Injectable()
export class ProjectService {
  constructor(private readonly projectRepository: UserProjectRepository) {}

  async create(userId: string, dto: CreateUserProjectDto) {
    return this.projectRepository.create({ userId, ...dto });
  }

  async findAllByUserId(userId: string) {
    return this.projectRepository.findAllByUserId(userId);
  }

  async findByIdAndUserId(id: string, userId: string) {
    const project = await this.projectRepository.findByIdAndUserId(id, userId);
    if (!project) {
      throw new NotFoundException('Project entry not found');
    }
    return project;
  }

  async update(
    id: string,
    userId: string,
    dto: Partial<CreateUserProjectDto>,
  ) {
    await this.findByIdAndUserId(id, userId);
    await this.projectRepository.update(id, userId, dto);
    return this.projectRepository.findByIdAndUserId(id, userId);
  }

  async remove(id: string, userId: string) {
    await this.findByIdAndUserId(id, userId);
    await this.projectRepository.remove(id, userId);
    return { message: 'Project entry deleted successfully' };
  }
}
