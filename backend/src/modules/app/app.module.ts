import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../../common/guards/email-verified.guard';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatModule } from '../chat/chat.module';
import { ThrottlerModule, ThrottlerGuard, seconds } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { ConfigModule, ConfigService } from '@nestjs/config';
import envValueValidations from 'src/lib/env-value-validations';
import { ServeStaticModule } from '@nestjs/serve-static';
import { HealthModule } from '../health/health.module';
import { MailModule } from '../mail/mail.module';
import { JobAdsModule } from '../job-ads/job-ads.module';
import { AtsModule } from '../ats/ats.module';
import { ResumesModule } from '../resumes/resumes.module';

const imports = [
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: `.env.${process.env.NODE_ENV}`,
    ignoreEnvFile: process.env.NODE_ENV === 'production',
    validationSchema: envValueValidations,
  }),
  AuthModule,
  UsersModule,
  MailModule,
  SequelizeModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      dialect: 'postgres',
      port: 5432,

      dialectOptions:
        process.env.NODE_ENV === 'production'
          ? {
              ssl: {
                require: true,
                rejectUnauthorized: config.get<boolean>(
                  'DB_SSL_REJECT_UNAUTHORIZED',
                  true,
                ),
                ...(config.get<string>('DB_SSL_CA')
                  ? {
                      ca: require('fs').readFileSync(
                        config.get<string>('DB_SSL_CA')!,
                      ),
                    }
                  : {}),
              },
            }
          : {},

      host: config.getOrThrow('DB_HOST'),
      username: config.getOrThrow('DB_USERNAME'),
      password: config.getOrThrow('DB_PASSWORD'),
      database: config.getOrThrow('DB_DATABASE'),
      timezone: '+00:00',
      autoLoadModels: true,
      synchronize: false,
      define: {
        underscored: true,
      },
    }),
  }),

  ServeStaticModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => [
      {
        rootPath: process.env.FRONTEND_BUILD_PATH,
        renderPath: '/{*path}',
      },
    ],
  }),
  CacheModule.registerAsync({
    isGlobal: true,
    useFactory: async () => {
      if (process.env.REDIS_ENABLED === 'true') {
        const { REDIS_HOST, REDIS_PORT, REDIS_USER, REDIS_PASSWORD } =
          process.env;
        const url = `redis://${REDIS_USER}:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`;
        return {
          store: await redisStore({
            url,
          }),
        };
      }
      return {};
    },
  }),
  HealthModule,
  JobAdsModule,
  AtsModule,
  ResumesModule,
  ThrottlerModule.forRootAsync({
    useFactory: () => {
      const throttlers = [
        {
          ttl: seconds(60),
          limit: 20,
        },
      ];

      if (process.env.REDIS_ENABLED === 'true') {
        const { REDIS_HOST, REDIS_PORT, REDIS_USER, REDIS_PASSWORD } =
          process.env;
        const url = `redis://${REDIS_USER}:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`;
        return {
          throttlers,
          storage: new ThrottlerStorageRedisService(url),
        };
      }

      return { throttlers };
    },
  }),
];

if (process.env.SOCKETIO_ENDPOINT_ON) {
  imports.push(ChatModule);
}

@Module({
  imports,
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: EmailVerifiedGuard },
  ],
})
export class AppModule {}
