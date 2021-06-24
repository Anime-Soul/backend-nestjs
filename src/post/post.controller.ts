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
import { CreatePostArgs, QueryPostsArgs } from './post.dto';
import { PostService } from './post.service';
import Post from '../entity/Post';
import { IReq, POST_TYPE, ROLESMAP } from '../type';
import { RolesGuard } from '../common/guards/roles.guard';
import { ExRoles, Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/auth.decorator';
import { SqlQueryErrorRes } from '../common/util/sql.error.response';
import Appraisal from '../entity/Appraisal';
import Video from '../entity/Video';
import { JwtService } from '@nestjs/jwt';
import { Topic } from 'src/entity/Topic';
import { subMonths } from 'date-fns';
import { OptionalAppraisalField } from 'src/appraisal/appraisal.dto';
import { OptionalTopicField } from 'src/topic/topic.dto';

@Controller('post')
@UseGuards(RolesGuard)
export class PostController {
  constructor(
    private readonly postService: PostService,
    @InjectRepository(Post)
    private readonly PostRepository: Repository<Post>,
    @InjectRepository(Video)
    private readonly VideoRepository: Repository<Video>,
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
    @InjectRepository(Appraisal)
    private AppraisalRepository: Repository<Appraisal>,
  ) {}

  @P()
  @ExRoles([ROLESMAP.Blocked])
  create(@Body() params: CreatePostArgs, @Req() { user }) {
    return this.postService.create({ creatorId: user.userId, ...params });
  }

  @Public()
  @Get('list')
  async list(@Query() body: QueryPostsArgs, @Req() req: IReq) {
    const {
      offset = 0,
      limit = 15,
      type = POST_TYPE.VIDEO,
      title,
      sort,
      creatorId,
    } = body;
    const _sort: OrderByCondition = {};
    let groupBy = 'p.id, c.id, t.id, a.id';

    const rep = this.PostRepository.createQueryBuilder('p').where(
      'p.type=:type',
      { type },
    );

    if (title) {
      rep.andWhere('p.title like :title', {
        title: `%${title}%`,
      });
    }

    if (creatorId) rep.andWhere('p.creatorId=:creatorId', { creatorId });

    const qb = rep
      .select([
        'p',
        'u.id',
        'u.username',
        'u.bio',
        'u.avatar',
        't',
        'c',
        'a.id',
        'a.rate',
      ])
      .leftJoin('p.creator', 'u')
      .leftJoin('p.categories', 'c')
      .leftJoin('p.tags', 't')
      .leftJoin('p.appraisals', 'a')
      .loadRelationCountAndMap('p.topicCount', 'p.topics')
      .loadRelationCountAndMap('p.videoCount', 'p.videos')
      .loadRelationCountAndMap('p.appraisalCount', 'p.appraisals')
      .loadRelationCountAndMap('p.likerCount', 'p.liker');

    if (type == POST_TYPE.VIDEO)
      qb.loadRelationCountAndMap('p.childrenCount', 'p.children');

    // github.com/typeorm/typeorm/issues/6561
    switch (sort) {
      case 'hot':
        qb.addSelect('COUNT(a.id)', 'aCount')
          .leftJoin('p.appraisals', 'ap')
          .addSelect('COUNT(tp.id)', 'topicCount')
          .leftJoin('p.topics', 'tp')
          .addSelect('COUNT(lk.id)', 'likerCount')
          .leftJoin('p.liker', 'lk');

        if (type == POST_TYPE.VIDEO) {
          qb.addSelect('COUNT(ch.id)', 'chCount').leftJoin('p.children', 'ch');
          _sort['chCount'] = 'DESC';
        }

        _sort['aCount'] = 'DESC';
        _sort['topicCount'] = 'DESC';
        _sort['likerCount'] = 'DESC';
        groupBy += ', lk.id, tp.id';
        break;
      case 'rate':
        qb.addSelect('SUM(a.rate)', 'arate').leftJoin('p.appraisals', 'aaa');
        _sort['arate'] = 'DESC';
        break;
      case 'month': // 本月新上线
        const date = new Date();
        qb.andWhere('p.createdAt BETWEEN  :s AND :e', {
          s: subMonths(date, 1),
          e: date,
        });
        break;
      default:
        break;
    }
    _sort['p.createdAt'] = 'DESC'; // 就近原则

    if (req.headers.authorization) {
      const user: any = new JwtService({
        secret: process.env.JWT_SECRET,
      }).decode(req.headers.authorization.substring(7));
      if (user?.userId) {
        qb.leftJoin('p.liker', 'lk2', 'lk2.id=:id', {
          id: user.userId,
        }).addSelect('lk2.id');

        groupBy += ', lk2.id';
      }
    }
    // 不生效
    //   .addSelect(
    //   'IF(ISNULL(lk.id),0,1) AS is_star',
    // );

    const raw: Array<Post> = await qb
      .skip(offset * limit)
      .take(limit)
      .orderBy(_sort)
      .groupBy(groupBy)
      .getMany();

    const result = raw.map((_) => {
      _.isLike = _.liker?.length > 0 ? 1 : 0;
      _.rate = +(
        _.appraisals.reduce((p, c) => p + c.rate, 0) / _.appraisals.length || 0
      ).toFixed(1);

      delete _.appraisals;
      delete _.liker;
      return _;
    });

    return { code: 200, data: result };
  }

  @Get(':id')
  async getPostById(@Param('id') id: string) {
    const post = await this.PostRepository.createQueryBuilder('p')
      .where('p.id = :pid', { pid: id })
      .leftJoinAndSelect('p.creator', 'u')
      .loadRelationCountAndMap('p.topicCount', 'p.topics')
      .loadRelationCountAndMap('p.videoCount', 'p.videos')
      .loadRelationCountAndMap('p.likerCount', 'p.liker')
      .loadRelationCountAndMap('p.childrenCount', 'p.children')
      .getOne();

    if (!post) return { code: 404 };

    const { rate } = await this.AppraisalRepository.createQueryBuilder('a')
      .select(['a.rate'])
      .where('bindPostId = :id', { id })
      .select('AVG(a.rate)', 'rate')
      .getRawOne<{ rate: string }>();

    post.rate = parseInt(rate) ?? 0;

    this.postService.glance(id);

    return { code: 200, data: post };
  }

  @Get(':id/videos')
  async getVideoByPostId(@Param('id') id: string) {
    const v = await this.VideoRepository.find({
      where: { bindPost: id },
      order: { episode: 'ASC' },
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
    @Body() { title, content }: OptionalTopicField,
    @Req() { user },
    @Param('postId') id: string,
  ) {
    try {
      const p = await this.PostRepository.findOne(id, { select: ['status'] });
      if (!p || p.status < 0) return { code: 403, message: '宿主异常' };
      const c = await this.topicRepository.create({ title, content }).save();
      await this.PostRepository.createQueryBuilder('p')
        .relation(Post, 'topics')
        .of(id)
        .add(c.id);
      await this.topicRepository
        .createQueryBuilder('c')
        .relation(Topic, 'creator')
        .of(c.id)
        .set(user.userId);
      const comment = await this.topicRepository.findOne(c.id);
      return { code: 200, data: comment };
    } catch (error) {
      return { code: 500, message: error.toString() };
    }
  }

  //TODO 分页
  @Get(':postId/comments')
  async getCommentsByPostId(@Param('postId') id: string) {
    const comments = await this.topicRepository.find({
      where: { bindPost: id },
      order: { createdAt: 'DESC' },
      relations: ['creator'],
    });
    return { code: 200, data: comments };
  }

  @P(':postId/appraisal')
  async appr(
    @Param('postId') id: string,
    @Req() { user }: IReq,
    @Body() body: OptionalAppraisalField,
  ) {
    const data = await this.AppraisalRepository.create({
      creator: { id: user.userId },
      bindPost: { id },
      ...body,
    }).save();
    return { code: HttpStatus.CREATED, data };
  }

  //TODO 分页
  @Get(':postId/appraisals')
  async getAppraisalsByPostId(@Param('postId') id: string) {
    const { appraisals } = await this.PostRepository.findOne(id, {
      relations: ['appraisals'],
      select: ['id'],
    });
    return { code: 200, data: appraisals };
  }

  @Patch(':postId/glance')
  async glance(@Param('postId') id: string) {
    return this.postService.glance(id);
  }

  @Patch(':postId/up')
  async up(@Param('postId') id: string, @Req() { user }: IReq) {
    await this.PostRepository.createQueryBuilder('p')
      .relation(Post, 'liker')
      .of(id)
      .add(user.userId);

    return { code: 200 };
  }

  @Patch(':postId/down')
  async down(@Param('postId') id: string, @Req() { user }: IReq) {
    await this.PostRepository.createQueryBuilder('p')
      .relation(Post, 'liker')
      .of(id)
      .remove(user.userId);

    return { code: 200 };
  }

  // TODO
  @P(':postId/forward')
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  foraward() {}
}
