import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Appraisal from '../entity/Appraisal';
import Category from '../entity/Category';
import Post from '../entity/Post';
import Tag from '../entity/Tag';
import User from '../entity/User';
import Video from '../entity/Video';
import Comment from '../entity/Comment';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Post,
      Video,
      Appraisal,
      Category,
      Tag,
      Comment,
    ]),
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
