import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AtsScore } from './ats-score.model';
import { AtsScoreRepository } from './ats-score.repository';
import { AtsService } from './ats.service';
import { AtsController } from './ats.controller';
import { UsersModule } from '../users/users.module';
import { JobAdsModule } from '../job-ads/job-ads.module';
import { OpenAiService } from '../../lib/openai.service';

@Module({
  imports: [SequelizeModule.forFeature([AtsScore]), UsersModule, JobAdsModule],
  providers: [AtsScoreRepository, AtsService, OpenAiService],
  controllers: [AtsController],
  exports: [AtsScoreRepository],
})
export class AtsModule {}
