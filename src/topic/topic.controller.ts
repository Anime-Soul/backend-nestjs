import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post as P,
  Query,
  Req,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderByCondition, Repository } from 'typeorm';
import { IReq, ROLESMAP } from '../type';
import { ExRoles } from '../common/decorators/roles.decorator';
import Comment from '../entity/Comment';
import { TopicService } from './topic.service';
import { Topic } from 'src/entity/Topic';
import { OptionalTopicField } from './topic.dto';
import { Public } from 'src/common/decorators/auth.decorator';
import { CommentDto, QueryPostsArgs } from 'src/post/post.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('topic')
export class TopicController {
  constructor(
    private readonly topicService: TopicService,
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    @InjectRepository(Comment)
    private CommentRepository: Repository<Comment>,
  ) {}

  @P()
  @ExRoles([ROLESMAP.Blocked])
  async create(@Body() params: OptionalTopicField, @Req() { user }) {
    const data = await this.topicRepository
      .create({
        creator: { id: user.userId },
        bindPost: { id: params.postId },
        ...params,
      })
      .save();
    return {
      code: HttpStatus.CREATED,
      data,
    };
  }

  @Public()
  @Get('s')
  async list(@Query() body: QueryPostsArgs, @Req() req: IReq) {
    const { offset = 0, limit = 15, title, sort, creatorId } = body;
    const rep = this.topicRepository.createQueryBuilder('t');
    const _sort: OrderByCondition = {};
    let groupBy = 't.id, tag.id';

    if (title) {
      rep.andWhere('t.title like :title', {
        title: `%${title}%`,
      });
      rep.orWhere('t.content like :content', {
        content: `%${title}%`,
      });
    }

    if (creatorId) rep.andWhere('t.creatorId=:creatorId', { creatorId });

    const qb = rep
      .select(['t', 'u.id', 'u.username', 'u.bio', 'u.avatar', 'tag'])
      .leftJoin('t.creator', 'u')
      .leftJoin('t.tags', 'tag')
      .loadRelationCountAndMap('t.commentCount', 't.comments')
      .loadRelationCountAndMap('t.likerCount', 't.liker');

    switch (sort) {
      case 'hot':
        qb.addSelect('COUNT(c.id)', 'commentCount')
          .leftJoin('t.comments', 'c')
          .addSelect('COUNT(lk.id)', 'likerCount')
          .leftJoin('t.liker', 'lk');

        _sort['commentCount'] = 'DESC';
        _sort['likerCount'] = 'DESC';
        groupBy += ', lk.id, c.id';
        break;
      default:
        break;
    }
    _sort['t.createdAt'] = 'DESC';

    if (req.headers.authorization) {
      const user: any = new JwtService({
        secret: process.env.JWT_SECRET,
      }).decode(req.headers.authorization.substring(7));
      if (user?.userId) {
        qb.leftJoin('t.liker', 'lk2', 'lk2.id=:id', {
          id: user.userId,
        }).addSelect('lk2.id');

        groupBy += ', lk2.id';
      }
    }

    const raw: Array<Topic> = await qb
      .skip(offset * limit)
      .take(limit)
      .orderBy(_sort)
      .groupBy(groupBy)
      .getMany();

    const result = raw.map((_) => {
      _.isLike = _.liker?.length > 0 ? 1 : 0;
      delete _.liker;
      return _;
    });

    return { code: 200, data: result };
  }

  @P(':postId/comment')
  async comment(
    @Body() { ...body }: CommentDto,
    @Req() { user },
    @Param('postId') id: string,
  ) {
    try {
      const p = await this.topicRepository.findOne(id, { select: ['status'] });
      if (!p || p.status < 0) return { code: 403, message: '宿主被屏蔽' };
      const c = await this.CommentRepository.create({
        content: body.content,
      }).save();
      await this.topicRepository
        .createQueryBuilder('t')
        .relation(Topic, 'comments')
        .of(id)
        .add(c.id);
      await this.CommentRepository.createQueryBuilder('c')
        .relation(Topic, 'creator')
        .of(c.id)
        .set(user.userId);
      const comment = await this.CommentRepository.findOne(c.id);
      return { code: 200, data: comment };
    } catch (error) {
      return { code: 500, message: error.toString() };
    }
  }

  @Get(':postId/comments')
  async getCommentsByPostId(@Param('postId') id: string) {
    const comments = await this.CommentRepository.find({
      where: { bindTopic: id },
      order: { createdAt: 'DESC' },
      relations: ['creator', 'children'],
    });
    return { code: 200, data: comments };
  }

  @Patch(':postId/glance')
  async glance(@Param('postId') id: string) {
    const v = await this.topicRepository.findOne(id, { select: ['view'] });
    await this.topicRepository.update(id, { view: v.view + 1 });
    return { code: 200 };
  }

  @Patch(':postId/up')
  async up(@Param('postId') id: string, @Req() { user }: IReq) {
    await this.topicRepository
      .createQueryBuilder('p')
      .relation(Topic, 'liker')
      .of(id)
      .add(user.userId);

    return { code: 200 };
  }

  @Patch(':postId/down')
  async down(@Param('postId') id: string, @Req() { user }: IReq) {
    await this.topicRepository
      .createQueryBuilder('p')
      .relation(Topic, 'liker')
      .of(id)
      .remove(user.userId);

    return { code: 200 };
  }
}
