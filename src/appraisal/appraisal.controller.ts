import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post as PostReq,
  Query,
  Req,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Public } from 'src/common/decorators/auth.decorator';
import { ExRoles } from 'src/common/decorators/roles.decorator';
import Appraisal from 'src/entity/Appraisal';
import Comment from 'src/entity/Comment';
import { CommentDto, QueryPostsArgs } from 'src/post/post.dto';
import { EVERT_STATUS, ROLESMAP } from 'src/type';
import { OrderByCondition, Repository } from 'typeorm';
import { OptionalAppraisalField } from './appraisal.dto';

@Controller('appraisal')
export class AppraisalController {
  constructor(
    @InjectRepository(Appraisal)
    private readonly AppraisalRepository: Repository<Appraisal>,
  ) {}

  @PostReq()
  @ExRoles([ROLESMAP.Blocked])
  async create(
    @Body() { postId, ...params }: OptionalAppraisalField,
    @Req() { user },
  ) {
    const data = await this.AppraisalRepository.create({
      creator: user.userId,
      bindPost: { id: postId },
      ...params,
    }).save();
    return { code: HttpStatus.CREATED, data };
  }

  @Public()
  @Get('list')
  async list(@Query() body: QueryPostsArgs) {
    const rep = this.AppraisalRepository.createQueryBuilder('a');
    const { offset = 0, limit = 15, title, sort, creatorId } = body;
    const _sort: OrderByCondition = {};
    let groupBy = 'a.id, u.id, p.id';

    if (title) {
      rep.where('a.title like :title', {
        title: `%${title}%`,
      });
      rep.orWhere('a.content like :content', {
        content: `%${title}%`,
      });
    }

    if (creatorId) rep.andWhere('a.creatorId=:creatorId', { creatorId });

    const qb = rep
      .where('a.status>:status', { status: EVERT_STATUS.BLOCKED })
      .select([
        'a',
        'p.id',
        'p.title',
        'p.cover',
        'u.id',
        'u.username',
        'u.bio',
        'u.avatar',
      ])
      .leftJoin('a.creator', 'u')
      .leftJoin('a.bindPost', 'p')
      .loadRelationCountAndMap('a.commentCount', 'a.comments')
      .loadRelationCountAndMap('a.likerCount', 'a.liker');

    switch (sort) {
      case 'hot':
        qb.addSelect('COUNT(cm.id)', 'commentCount')
          .leftJoin('a.comments', 'cm')
          .addSelect('COUNT(lk.id)', 'likerCount')
          .leftJoin('a.liker', 'lk');
        _sort['commentCount'] = 'DESC';
        _sort['likerCount'] = 'DESC';
        groupBy += ', lk.id, cm.id';
      default:
        break;
    }
    _sort['a.createdAt'] = 'DESC'; // 就近原则

    const raw = await qb
      .skip(offset * limit)
      .take(limit)
      .orderBy(_sort)
      .groupBy(groupBy)
      .getMany();

    return { code: 200, data: raw };
  }

  @Get(':id')
  async getPostById(@Param('id') id: string) {
    const appraisal = await this.AppraisalRepository.createQueryBuilder('a')
      .where('a.id = :pid', { pid: id })
      .leftJoinAndSelect('a.creator', 'u')
      .leftJoinAndSelect('a.bindPost', 'p')
      .leftJoinAndSelect('a.comments', 'commenst')
      .leftJoinAndSelect('a.liker', 'liker')
      .getOne();

    if (!appraisal) return { code: 404 };

    return { code: 200, data: appraisal };
  }

  @PostReq(':appraisalId/comment')
  async comment(
    @Body() { ...body }: CommentDto,
    @Req() { user },
    @Param('appraisalId') id: string,
  ) {
    try {
      const p = await this.AppraisalRepository.findOne(id, {
        select: ['status'],
      });
      if (!p || p.status < 0) return { code: 403, message: '宿主被屏蔽' };
      const c = await Comment.create({
        content: body.content,
      }).save();
      await this.AppraisalRepository.createQueryBuilder('a')
        .relation(Appraisal, 'comments')
        .of(id)
        .add(c.id);
      await Comment.createQueryBuilder('c')
        .relation(Comment, 'creator')
        .of(c.id)
        .set(user.userId);
      const comment = await Comment.findOne(c.id);
      return { code: 200, data: comment };
    } catch (error) {
      return { code: 500, message: error.toString() };
    }
  }

  @Get(':appraisalId/comments')
  async getCommentsByappraisalId(@Param('appraisalId') id: string) {
    const comments = await Comment.find({
      where: { bindAppraisal: id },
      order: { createdAt: 'DESC' },
      relations: ['creator'],
    });
    return { code: 200, data: comments };
  }
}
