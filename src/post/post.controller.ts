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
import { CreatePostArgs, QueryPostsArgs } from './post.dto';
import { PostService } from './post.service';
import Post from '../entity/Post';
import { ROLESMAP } from 'src/type';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Public } from 'src/common/decorators/auth.decorator';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';

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
  async list(@Query() body: QueryPostsArgs) {
    const rep = this.PostRepository.createQueryBuilder('p');
    const { offset = 0, limit = 15, where = {} } = body;
    const { type, title } = where;
    console.log({ ...body });

    if (title)
      rep.where('p.title like :title', {
        title: `%${title}%`,
      });

    if (type) rep.where('p.type=:type', { type });

    return {
      code: 200,
      data: await rep
        .leftJoinAndSelect('p.creator', 'c') //todo限制字段
        .skip(offset * limit)
        .take(limit)
        // sort 不能daxie
        // .orderBy('createdAt', 'DESC')
        .getMany(),
    };
  }

  @Get(':id')
  getPostById(@Param('id') id: string) {
    return { code: 200, data: this.PostRepository.findOne(id).then((_) => _) };
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
          throw new HttpException('重复添加', HttpStatus.BAD_REQUEST);
        }
        throw new HttpException('', HttpStatus.BAD_REQUEST);
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
      .relation('tags')
      .of(postId)
      .add(tagId)
      .catch((_) => {
        if (_.code === 'ER_DUP_ENTRY' || _.errno === 1062) {
          throw new HttpException('重复添加', HttpStatus.BAD_REQUEST);
        }
        throw new HttpException('', HttpStatus.BAD_REQUEST);
      });
    return { code: 200 };
  }
}
