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
import { IReq, POST_TYPE, ROLESMAP } from '../type';
import { RolesGuard } from '../common/guards/roles.guard';
import { ExRoles, Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/auth.decorator';
import { SqlQueryErrorRes } from '../common/util/sql.error.response';
import Comment from '../entity/Comment';
import Appraisal from '../entity/Appraisal';
import Video from '../entity/Video';
import { JwtService } from '@nestjs/jwt';

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
  @ExRoles([ROLESMAP.Blocked])
  create(@Body() params: CreatePostArgs, @Req() { user }) {
    return {
      code: HttpStatus.CREATED,
      data: this.postService.create({ creatorId: user.userId, ...params }),
    };
  }

  @Public()
  @Get('list')
  async list(@Query() body: QueryPostsArgs, @Req() req: IReq) {
    const { offset = 0, limit = 15, type = 0, title, sort, creatorId } = body;
    const _sort: OrderByCondition = {};
    let groupBy = 'p.id, c.id, t.id';

    const rep = this.PostRepository.createQueryBuilder(
      'p',
    ).andWhere('p.type=:type', { type });

    if (title) {
      if (type == POST_TYPE.VIDEO) {
        rep.where('p.title like :title', {
          title: `%${title}%`,
        });
      } else if (type == POST_TYPE.POST) {
        rep.where('p.content like :content', {
          content: `%${title}%`,
        });
      }
    }

    if (creatorId) rep.andWhere('p.creatorId=:creatorId', { creatorId });

    // https://blog.csdn.net/qq_34637782/article/details/101029487
    const qb = rep
      .select([
        'p',
        'u.id',
        'u.username',
        'u.bio',
        'u.avatar',
        't',
        'c',
        // 'a.rate',
        // 'AVG(a.rate) rate', // 这里拿不到去详情页在请求吧 或者放到子查询 比如 hot 排序里面
      ])
      .leftJoin('p.creator', 'u')
      .leftJoin('p.categories', 'c')
      .leftJoin('p.tags', 't')
      // .leftJoin('p.appraisals', 'a') // 这里拿不到去详情页在请求吧
      .loadRelationCountAndMap('p.commentCount', 'p.comments')
      .loadRelationCountAndMap('p.videoCount', 'p.videos')
      .loadRelationCountAndMap('p.likerCount', 'p.liker');

    // github.com/typeorm/typeorm/issues/6561
    switch (sort) {
      case 'hot':
        qb.addSelect('COUNT(cm.id)', 'commentCount')
          .leftJoin('p.comments', 'cm')
          .addSelect('COUNT(lk.id)', 'likerCount')
          .leftJoin('p.liker', 'lk');
        _sort['commentCount'] = 'DESC';
        _sort['likerCount'] = 'DESC';
        groupBy += ', lk.id, cm.id';
      default:
        break;
    }
    _sort['p.createdAt'] = 'DESC'; // 就近原则

    if (req.headers.authorization) {
      const user: any = new JwtService({
        secret: process.env.JWT_SECRET,
      }).decode(req.headers.authorization.substring(7));

      user?.userId &&
        qb
          .leftJoin('p.liker', 'lk2', 'lk2.id=:id', {
            id: user.userId,
          })
          .addSelect('lk2.id') &&
        (groupBy += ', lk2.id');
    }
    // 不生效
    //   .addSelect(
    //   'IF(ISNULL(lk.id),0,1) AS is_star',
    // );

    const raw: Array<any> = await qb
      .skip(offset * limit)
      .take(limit)
      .orderBy(_sort)
      .groupBy(groupBy)
      .getMany();

    const result = raw.map((_) => {
      if (_?.liker?.length > 0) {
        _.isLike = 1;
      } else {
        _.isLike = 0;
      }
      delete _.liker;
      return _;
    });

    // if (type == POST_TYPE.VIDEO) {
    //   result = result.filter((_) => _.videoCount > 0);
    // }

    return { code: 200, data: result };
  }

  @Get(':id')
  async getPostById(@Param('id') id: string) {
    const post = await this.PostRepository.createQueryBuilder('p')
      .where('p.id = :pid', { pid: id })
      .leftJoinAndSelect('p.creator', 'u')
      .loadRelationCountAndMap('p.commentCount', 'p.comments', 'cm')
      .loadRelationCountAndMap('p.videoCount', 'p.videos', 'v')
      .loadRelationCountAndMap('p.likerCount', 'p.liker', 'l')
      .getOne();

    if (!post) return { code: 404 };

    const { rate } = await this.AppraisalRepository.createQueryBuilder('a')
      .select(['a.rate'])
      .where('bindPostId = :id', { id })
      .select('AVG(a.rate)', 'rate')
      .getRawOne<{ rate: string }>();

    post.rate = rate ? parseInt(rate) : 0;

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
      const comment = await Comment.findOne(c.id);
      return { code: 200, data: comment };
    } catch (error) {
      return { code: 500, message: error.toString() };
    }
  }

  //TODO 分页
  @Get(':postId/comments')
  async getCommentsByPostId(@Param('postId') id: string) {
    const comments = await this.CommentRepository.find({
      where: { bindPost: id },
      order: { createdAt: 'DESC' },
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
