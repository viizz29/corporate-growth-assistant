import { Controller, Get, Optional } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  SequelizeHealthIndicator,
} from '@nestjs/terminus';
import { RedisHealthIndicator } from './redis-health-indicator';
import { Public } from '../../common/decorators/public.decorator';

@Public()
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private sequelize: SequelizeHealthIndicator,
    @Optional() private redisIndicator: RedisHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    const checks = [
      () => this.sequelize.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 500 * 1024 * 1024),
      () =>
        this.disk.checkStorage('storage', {
          path: '/',
          thresholdPercent: 0.9,
        }),
    ];

    if (this.redisIndicator) {
      checks.splice(1, 0, () => this.redisIndicator.isHealthy('redis'));
    }

    return this.health.check(checks);
  }

  @Get('live')
  live() {
    return {
      status: 'ok',
    };
  }

  @Get('ready')
  @HealthCheck()
  ready() {
    const checks = [() => this.sequelize.pingCheck('database')];

    if (this.redisIndicator) {
      checks.push(() => this.redisIndicator.isHealthy('redis'));
    }

    return this.health.check(checks);
  }
}
