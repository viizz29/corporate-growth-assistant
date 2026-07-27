import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class TokenBlacklistService implements OnModuleInit {
  private redis: Redis | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    if (this.configService.get<string>('REDIS_ENABLED') === 'true') {
      this.redis = new Redis({
        host: this.configService.get<string>('REDIS_HOST', '127.0.0.1'),
        port: this.configService.get<number>('REDIS_PORT', 6379),
        username: this.configService.get<string>('REDIS_USER', 'default'),
        password: this.configService.get<string>('REDIS_PASSWORD', ''),
      });
    }
  }

  async blacklist(jti: string, ttlSeconds: number): Promise<void> {
    if (!this.redis) return;
    await this.redis.setex(`bl:${jti}`, ttlSeconds, '1');
  }

  async isBlacklisted(jti: string): Promise<boolean> {
    if (!this.redis) return false;
    const result = await this.redis.get(`bl:${jti}`);
    return result === '1';
  }
}
