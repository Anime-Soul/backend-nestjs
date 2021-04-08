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
import { CreatePostArgs, QueryPostsArgs, CommentDto } from './post.dto';
import { PostService } from './post.service';
import Post from '../entity/Post';
import { ROLESMAP } from 'src/type';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Public } from 'src/common/decorators/auth.decorator';
import { SqlQueryErrorRes } from 'src/common/util/sql.error.response';
import Comment from 'src/entity/Comment';
import Appraisal from 'src/entity/Appraisal';

@Controller('post')
@UseGuards(RolesGuard)
export class PostController {
  constructor(
    private readonly postService: PostService,
    @InjectRepository(Post)
    private readonly PostRepository: Repository<Post>,
    @InjectRepository(Comment)
    private CommentRepository: Repository<Comment>,
    @InjectRepository(Appraisal)
    private AppraisalRepository: Repository<Appraisal>,
  ) {}

  @P()
  @Roles(ROLESMAP.WRITER, ROLESMAP.ADMIN, ROLESMAP.ROOT)
  create(@Body() params: CreatePostArgs, @Req() { user }) {
    return this.postService.create({ creatorId: user.userId, ...params });
  }

  @Public()
  @Get('list')
  async list(@Body() body: QueryPostsArgs) {
    const rep = this.PostRepository.createQueryBuilder('p');
    const { offset = 0, limit = 15, type, title } = body;

    if (title)
      rep.where('p.title like :title', {
        title: `%${title}%`,
      });

    if (type) rep.andWhere('p.type=:type', { type });

    const p = await rep
      .select(['p', 'u.id', 'u.username', 'u.bio', 'u.avatar', 't', 'c', 'a'])
      .leftJoin('p.creator', 'u')
      .leftJoin('p.categories', 'c')
      .leftJoin('p.tags', 't')
      .leftJoin('p.appraisals', 'a') //TODO: 只查询 rate 字段
      .loadRelationCountAndMap('p.commentCount', 'p.comments', 'cm')

      // .leftJoin((qb: SelectQueryBuilder<Appraisal>) => {
      //   return qb
      //     .subQuery()
      //     .from('appraisal', 'a')
      //     .where('a.bindPostId = p.id')
      //     .select('SUM(a.rate)', 'sum')
      //     .addSelect('COUNT(a.id)', 'count');
      // }, 'aa')
      // TODO: appraisal relation COUNT() SUM()
      // .leftJoin('p.appraisals', 'a')
      // .addSelect('COUNT(a.id)', 'count')
      // .addSelect('SUM(a.rate)', 'sum')
      // .groupBy('p.id')
      // .addGroupBy('c.id')
      // .addGroupBy('t.id')
      .skip(offset * limit)
      .take(limit)
      .orderBy('p.createdAt', 'DESC')
      .getMany();

    return { code: 200, data: p };
  }

  @Get(':id')
  async getPostById(@Param('id') id: string) {
    const post = await this.PostRepository.createQueryBuilder('p')
      .where('id = :pid', { pid: id })
      .loadRelationCountAndMap('p.commentCount', 'p.comments', 'cm')
      .getOne();

    const { sum, count } = await this.AppraisalRepository.createQueryBuilder(
      'a',
    )
      .where('bindPostId = :id', { id })
      .select('SUM(a.rate)', 'sum')
      .addSelect('COUNT(a.id)', 'count')
      .getRawOne<{ sum: string; count: string }>();

    console.log(sum, count);

    post.rate = +sum / +count;

    return { code: 200, data: post };
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
      .relation('categories')
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

  @P(':postId/comment')
  async comment(
    @Body() { ...body }: CommentDto,
    @Req() { user },
    @Param('postId') id: string,
  ) {
    try {
      const p = await this.PostRepository.findOne(id, { select: ['status'] });
      if (!p || p.status < 0) return { code: 403, message: '宿主被屏蔽' };
      const c = await this.CommentRepository.create({
        content: body.content,
      }).save();
      await this.PostRepository.createQueryBuilder('p')
        .relation(Post, 'comments')
        .of(id)
        .add(c.id);
      await this.CommentRepository.createQueryBuilder('c')
        .relation(Comment, 'creator')
        .of(c.id)
        .set(user.userId);
    } catch (error) {
      return { code: 500, message: error };
    }

    return { code: 200 };
  }

  //TODO 分页
  @Get(':postId/comments')
  async getCommentsByPostId(@Param('postId') id: string) {
    const { comments } = await this.PostRepository.findOne(id, {
      relations: ['comments'],
      select: ['id'],
    });
    return { code: 200, data: comments };
  }

  //TODO 分页
  @Get(':postId/appraisal')
  async getAppraisalsByPostId(@Param('postId') id: string) {
    const { appraisals } = await this.PostRepository.findOne(id, {
      relations: ['appraisals'],
      select: ['id'],
    });
    return { code: 200, data: appraisals };
  }

  @Get(':postId/glance')
  async glance(@Param('postId') id: string) {
    const v = await this.PostRepository.findOne(id, { select: ['view'] });
    await this.PostRepository.update(id, { view: v.view + 1 });
    return { code: 200 };
  }

  @Get(':postId/up')
  async up(@Param('postId') id: string) {
    const v = await this.PostRepository.findOne(id, { select: ['up'] });
    await this.PostRepository.update(id, { view: v.up + 1 });
    return { code: 200 };
  }

  // TODO
  @P(':postId/forward')
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  foraward() {}
}
