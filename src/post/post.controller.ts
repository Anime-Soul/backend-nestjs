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
import { OrderByCondition, Repository } from 'typeorm';
import { CreatePostArgs, QueryPostsArgs, CommentDto } from './post.dto';
import { PostService } from './post.service';
import Post from '../entity/Post';
import { ROLESMAP } from '../type';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/auth.decorator';
import { SqlQueryErrorRes } from '../common/util/sql.error.response';
import Comment from '../entity/Comment';
import Appraisal from '../entity/Appraisal';
import Video from '../entity/Video';

@Controller('post')
@UseGuards(RolesGuard)
export class PostController {
  constructor(
    private readonly postService: PostService,
    @InjectRepository(Post)
    private readonly PostRepository: Repository<Post>,
    @InjectRepository(Video)
    private readonly VideoRepository: Repository<Video>,
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
  async list(@Query() body: QueryPostsArgs) {
    const rep = this.PostRepository.createQueryBuilder('p');
    const { offset = 0, limit = 15, type, title, sort } = body;
    const _sort: OrderByCondition = { 'p.createdAt': 'DESC' };

    switch (sort) {
      case 'hot':
        _sort['p.up'] = 'DESC';
        _sort['p.view'] = 'DESC';
      //TODO: comment 多少排序
      default:
        break;
    }

    if (title)
      rep.where('p.title like :title', {
        title: `%${title}%`,
      });

    if (type) rep.andWhere('p.type=:type', { type });

    // https://blog.csdn.net/qq_34637782/article/details/101029487
    const p = await rep
      .select([
        'p',
        'u.id',
        'u.username',
        'u.bio',
        'u.avatar',
        't',
        'c',
        'AVG(a.rate) rate', // 这里拿不到去详情页在请求吧
      ])
      .leftJoin('p.creator', 'u')
      .leftJoin('p.categories', 'c')
      .leftJoin('p.tags', 't')
      .leftJoin('p.appraisals', 'a')
      .loadRelationCountAndMap('p.commentCount', 'p.comments', 'cm')
      .skip(offset * limit)
      .take(limit)
      .orderBy(_sort)
      .groupBy('p.id, c.id, t.id')
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

    post.rate = +sum / +count;

    return { code: 200, data: post };
  }

  @Get(':id/videos')
  async getVideoByPostId(@Param('id') id: string) {
    const v = await this.VideoRepository.find({
      where: { bindPost: id },
      order: { episode: 1 },
    });
    return { code: 200, data: v };
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
      return { code: 500, message: error.toString() };
    }

    return { code: 200 };
  }

  //TODO 分页
  @Get(':postId/comments')
  async getCommentsByPostId(@Param('postId') id: string) {
    const comments = await this.CommentRepository.find({
      where: { bindPost: id },
      relations: ['creator'],
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

  @Get(':postId/up') //TODO: uper
  async up(@Param('postId') id: string) {
    const v = await this.PostRepository.findOne(id, { select: ['up'] });
    await this.PostRepository.update(id, { up: v.up + 1 });
    return { code: 200 };
  }

  // TODO
  @P(':postId/forward')
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  foraward() {}
}
