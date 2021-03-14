import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post as P,
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
import { SqlQueryErrorRes } from 'src/common/util/sql.error.response';

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
  @P('list')
  async list(@Body() body: QueryPostsArgs) {
    const rep = this.PostRepository.createQueryBuilder('p');
    const { offset = 0, limit = 15, where = {} } = body;
    const { type, title } = where;

    if (title)
      rep.where('p.title like :title', {
        title: `%${title}%`,
      });

    if (type) rep.where('p.type=:type', { type });

    return {
      code: 200,
      data: await rep
        .leftJoinAndSelect('p.creator', 'u')
        .leftJoinAndSelect('p.categories', 'c')
        .leftJoinAndSelect('p.tags', 't')
        .skip(offset * limit)
        .take(limit)
        .orderBy('p.createdAt', 'DESC')
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
      .catch(SqlQueryErrorRes);
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
      .catch(SqlQueryErrorRes);
    return { code: 200 };
  }
}
