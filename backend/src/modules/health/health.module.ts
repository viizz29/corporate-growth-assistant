import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { RedisHealthIndicator } from './redis-health-indicator';
import Redis from 'ioredis';

const providers = [
  ...(process.env.REDIS_ENABLED === 'true'
    ? [
        RedisHealthIndicator,
        {
          provide: Redis,
          useFactory: () => {
            const { REDIS_HOST, REDIS_PORT, REDIS_USER, REDIS_PASSWORD } =
              process.env;
            return new Redis(
              `redis://${REDIS_USER}:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`,
            );
          },
        },
      ]
    : []),
];

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers,
})
export class HealthModule {}
