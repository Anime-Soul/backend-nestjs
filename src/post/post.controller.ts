import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post as P,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostArgs } from './post.dto';
import { PostService } from './post.service';
import Post from '../entity/Post';
import { ListDto, ROLESMAP } from 'src/type';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Public } from 'src/common/decorators/auth.decorator';

@Controller('post')
@UseGuards(RolesGuard)
export class PostController {
  constructor(
    private readonly postService: PostService,
    @InjectRepository(Post)
    private PostRepository: Repository<Post>,
  ) {}

  @P()
  @Roles(ROLESMAP.WRITER, ROLESMAP.ADMIN, ROLESMAP.ROOT)
  create(@Body() params: CreatePostArgs, @Req() { user }) {
    return this.postService.create({ creatorId: user.userId, ...params });
  }

  @Public()
  @Get('list')
  async list(@Query() { offset = 0, limit = 15 }: ListDto) {
    return {
      code: 200,
      data: await this.PostRepository.find({
        skip: offset * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      }),
    };
  }

  @Patch(':postId/ca/:categoryId')
  @Roles(ROLESMAP.WRITER, ROLESMAP.ADMIN, ROLESMAP.ROOT)
  async addCategory(@Param() { postId, categoryId }, @Req() { user }) {
    const post = await this.PostRepository.findOne(postId, {
      relations: ['creator'],
      select: ['id'],
    });

    if (user.userId !== post.creator.id && user.role > ROLESMAP.ADMIN)
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    await this.PostRepository.createQueryBuilder()
      .relation(Post, 'categories')
      .of(postId)
      .add(categoryId)
      .catch((_) => {
        if (_.code === 'ER_DUP_ENTRY' || _.errno === 1062) {
          throw new HttpException('ER_DUP_ENTRY', HttpStatus.BAD_REQUEST);
        }
        throw new HttpException(_.message || _, HttpStatus.BAD_REQUEST);
      });
    return { code: 200 };
  }

  @Patch(':postId/tag/:tagId')
  @Roles(ROLESMAP.WRITER, ROLESMAP.ADMIN, ROLESMAP.ROOT)
  async addTag(@Param() { postId, tagId }, @Req() { user }) {
    const post = await this.PostRepository.findOne(postId, {
      relations: ['creator'],
      select: ['id'],
    });

    if (user.userId !== post.creator.id && user.role > ROLESMAP.ADMIN)
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    await this.PostRepository.createQueryBuilder()
      .relation(Post, 'tags')
      .of(postId)
      .add(tagId)
      .catch((_) => {
        if (_.code === 'ER_DUP_ENTRY' || _.errno === 1062) {
          throw new HttpException('ER_DUP_ENTRY', HttpStatus.BAD_REQUEST);
        }
        throw new HttpException(_.message || _, HttpStatus.BAD_GATEWAY);
      });
    return { code: 200 };
  }
}
