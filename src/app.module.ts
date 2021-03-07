import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { isProd } from './common/env';
import { Connection } from 'typeorm';
import { PostModule } from './post/post.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'nest-dm',
      entities: ['./entity/*{.ts,.js}'],
      autoLoadEntities: true,
      synchronize: !isProd,
      keepConnectionAlive: true,
    }),
    UserModule,
    AuthModule,
    PostModule,
  ],
  providers: [],
})
export class AppModule /* implements NestModule */ {
  constructor(private connection: Connection) {}

  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(LoggerMiddleware)
  //     .forRoutes({ path: '(.*)', method: RequestMethod.ALL });
  // }
}
