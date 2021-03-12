import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Video from '../entity/Video';
import Post from '../entity/Post';

@Module({
  imports: [TypeOrmModule.forFeature([Video, Post])],
  providers: [VideoService],
  controllers: [VideoController],
})
export class VideoModule {}
