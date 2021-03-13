import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Post from '../entity/Post';
import Tag from '../entity/Tag';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tag, Post])],
  controllers: [TagController],
  providers: [TagService],
})
export class TagModule {}
