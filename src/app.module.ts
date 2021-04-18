import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { PostModule } from './post/post.module';
import { VideoModule } from './video/video.module';
import { TagModule } from './tag/tag.module';
import { CategoryModule } from './category/category.module';
import { AppController } from './app.controller';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    TypeOrmModule.forRoot(),
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
