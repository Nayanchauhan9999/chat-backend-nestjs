/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { HttpValidationPipe } from './common/pipes/http-validation.pipe';
import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariablesEnum } from './utils/constant';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.useGlobalPipes(new HttpValidationPipe());
  app.useGlobalFilters(new PrismaExceptionFilter());

  const configService = app.get(ConfigService);

  //Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  await app.listen(configService.get(EnvironmentVariablesEnum.PORT) ?? 3000);
}
bootstrap();
