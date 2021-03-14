import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { isProd } from './common/env';
import { Connection } from 'typeorm';
import { PostModule } from './post/post.module';
import { VideoModule } from './video/video.module';
import { TagModule } from './tag/tag.module';
import { CategoryModule } from './category/category.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: isProd ? 'su' : 'root',
      password: isProd ? 'Passw0rd.' : 'root',
      database: isProd ? 'nest_dm' : 'nest-dm',
      entities: ['./entity/*{.ts,.js}'],
      autoLoadEntities: true,
      synchronize: !isProd,
      keepConnectionAlive: true,
      logger: 'advanced-console',
      logging: ['query', 'error', 'warn'],
    }),
    UserModule,
    AuthModule,
    PostModule,
    VideoModule,
    TagModule,
    CategoryModule,
  ],
  providers: [],
  controllers: [AppController],
})
export class AppModule /* implements NestModule */ {
  constructor(private connection: Connection) {}

  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(LoggerMiddleware)
  //     .forRoutes({ path: '(.*)', method: RequestMethod.ALL });
  // }
}
