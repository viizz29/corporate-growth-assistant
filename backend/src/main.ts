import path, { join } from 'path';
process.env.TZ = 'America/Danmarkshavn';
process.env.PROJECT_LOCATION = path.dirname(__dirname);
process.env.WORKING_DIRECTORY = process.cwd();
process.env.RESOURCES_LOCATION = `${process.env.PROJECT_LOCATION}/res`;
process.env.FRONTEND_BUILD_PATH = process.env.FRONTEND_BUILD_PATH
  ? process.env.FRONTEND_BUILD_PATH
  : join(__dirname, '..', 'public');

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { FieldNameTransformerPipe } from './common/field-name-transformer.pipe';
import { FieldNameTransformerInterceptor } from './common/field-name-transformer.interceptor';
import { AppModule } from './modules/app/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(helmet());
  app.use(cookieParser());

  app.setGlobalPrefix(process.env.API_BASE_URL || '/api/v1');

  app.useGlobalPipes(
    new FieldNameTransformerPipe(),
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('App001 API')
      .setDescription('API description')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter JWT token',
          in: 'header',
        },
        'bearerAuth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup(process.env.DOCS_URL || '/docs', app, document, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: `${process.env.APP_ENV}`,
      customJs: `/api/swagger-init.js`,
    });
  }

  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? corsOrigin : true,
    credentials: true,
  });

  app.useGlobalInterceptors(new FieldNameTransformerInterceptor());

  app.enableShutdownHooks();

  if (process.env.NODE_ENV == 'production') {
    await app.listen(process.env.PORT || 3000, '0.0.0.0');
  } else {
    await app.listen(process.env.PORT || 3000);
  }
}

bootstrap()
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.log(err);
  });
