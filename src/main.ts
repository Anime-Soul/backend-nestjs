import { NestFactory, Reflector } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { isProd } from './common/env';
import { IAuthGuard } from './common/guards/auth.guard';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.setGlobalPrefix('api');
  app.useStaticAssets({ root: `${__dirname}/public` });
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const reflector = app.get(Reflector);
  app.useGlobalGuards(new IAuthGuard(reflector));

  await app.listen(3000, isProd ? '10.170.0.2' : '0.0.0.0');
  console.log(
    `[ ${
      isProd ? 'prod' : 'dev'
    } ]: Application is running on: ${await app.getUrl()}`,
  );
}

bootstrap();
