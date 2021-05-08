import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Category from 'src/entity/Category';
import Comment from 'src/entity/Comment';
import Tag from 'src/entity/Tag';
import { Topic } from 'src/entity/Topic';
import User from 'src/entity/User';
import { TopicController } from './topic.controller';
import { TopicService } from './topic.service';

@Module({
  imports: [TypeOrmModule.forFeature([Topic, User, Category, Tag, Comment])],
  controllers: [TopicController],
  providers: [TopicService],
})
export class TopicModule {}
