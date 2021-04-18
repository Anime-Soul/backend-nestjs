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
import { CommentModule } from './comment/comment.module';
import Appraisal from './entity/Appraisal';
import Category from './entity/Category';
import Tag from './entity/Tag';
import User from './entity/User';
import Video from './entity/Video';
import Post from './entity/Post';
import Comment from './entity/Comment';
import Imei from './entity/Imie';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PROT,
      username: process.env.DATABASE_USER_NAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: ['./entity/*{.ts,.js}'],
      autoLoadEntities: true,
      synchronize: !isProd,
      keepConnectionAlive: true,
      logger: isProd ? 'advanced-console' : 'advanced-console',
      logging: isProd ? ['warn', 'error'] : ['query', 'error', 'warn'],
    }),
    TypeOrmModule.forFeature([
      User,
      Post,
      Video,
      Appraisal,
      Category,
      Tag,
      Comment,
      Imei,
    ]),
    UserModule,
    AuthModule,
    PostModule,
    VideoModule,
    TagModule,
    CategoryModule,
    CommentModule,
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
