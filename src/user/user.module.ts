import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import User from '../entity/User';
import Post from '../entity/Post';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import Video from '../entity/Video';
import Category from '../entity/Category';
import Tag from '../entity/Tag';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Post, Video, Category, Tag]),
    AuthModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
