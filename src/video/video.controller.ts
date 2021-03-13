import {
  Body,
  Controller,
  Get,
  Post as P,
  Delete,
  Param,
  UseGuards,
  Patch,
  Req,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Post from '../entity/Post';
import Video from '../entity/Video';
import { ListDto, ROLESMAP } from '../type';
import { Repository } from 'typeorm';
import { CreateVideoArgs, OptionalVideoField } from './video.dto';
import { VideoService } from './video.service';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('video')
@UseGuards(RolesGuard)
export class VideoController {
  constructor(
    private readonly videoService: VideoService,
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    @InjectRepository(Post)
    private PostRepository: Repository<Post>,
  ) {}

  @Get('list')
  async list(@Query() { offset = 0, limit = 15 }: ListDto) {
    return {
      code: 200,
      data: await this.videoRepository.find({
        skip: offset * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      }),
    };
  }

  @P()
  @Roles(ROLESMAP.WRITER, ROLESMAP.ADMIN, ROLESMAP.ROOT)
  async create(
    @Body() { bindPostId, ...params }: CreateVideoArgs,
    @Req() { user },
  ) {
    const post = await this.PostRepository.findOne(bindPostId);
    let v: Video;
    if (post) {
      v = await this.videoRepository
        .create({
          bindPost: post,
          ...params,
          creatorId: user.userId,
        })
        .save();
    } else {
      return { code: 404, msg: 'Post not found' };
    }
    return { code: 200, data: v };
  }

  // todo 获取对应 post 的 creatorid 自己只能改自己的
  @Patch(':id')
  @Roles(ROLESMAP.WRITER, ROLESMAP.ADMIN, ROLESMAP.ROOT)
  async update(@Param('id') id: number, @Body() params: OptionalVideoField) {
    const res = await this.videoRepository.update(id, params);
    if (res.affected < 1) {
      return { code: 404, msg: 'Nothing happened' };
    } else {
      return { code: 201 };
    }
  }

  @Delete(':id')
  @Roles(ROLESMAP.WRITER, ROLESMAP.ADMIN, ROLESMAP.ROOT)
  async delete(@Param('id') id: number) {
    const res = await this.videoRepository.update(id, { status: -1 });
    if (res.affected < 1) {
      return { code: 404, msg: 'Nothing happened' };
    } else {
      return { code: 204 };
    }
  }
}
