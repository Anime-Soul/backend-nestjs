import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { isProd } from './common/env';
import { IAuthGuard } from './common/guards/auth.guard';
import * as express from 'express';

console.log(`${__dirname}/public`);

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.setGlobalPrefix('api');
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const reflector = app.get(Reflector);
  app.useGlobalGuards(new IAuthGuard(reflector));

  app.use(express.static(`${__dirname}/public`));

  await app.listen(3000, isProd ? '10.170.0.2' : '0.0.0.0');
  console.log(
    `[ ${
      isProd ? 'prod' : 'dev'
    } ]: Application is running on: ${await app.getUrl()}`,
  );
}

bootstrap();
