import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JobAdvertisement } from './job-advertisement.model';
import { JobAdvertisementRepository } from './job-advertisement.repository';
import { JobAdsService } from './job-ads.service';
import { JobAdsController } from './job-ads.controller';

@Module({
  imports: [SequelizeModule.forFeature([JobAdvertisement])],
  providers: [JobAdvertisementRepository, JobAdsService],
  controllers: [JobAdsController],
  exports: [JobAdvertisementRepository],
})
export class JobAdsModule {}
