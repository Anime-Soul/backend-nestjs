import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import User from 'src/entity/User';
import Post from 'src/entity/Post';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import Video from 'src/entity/Video';
import Appraisal from 'src/entity/Appraisal';
import Category from 'src/entity/Category';
import Tag from 'src/entity/Tag';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Post, Video, Appraisal, Category, Tag]),
    AuthModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
