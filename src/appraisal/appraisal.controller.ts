import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Public } from 'src/common/decorators/auth.decorator';
import { ExRoles } from 'src/common/decorators/roles.decorator';
import Appraisal from 'src/entity/Appraisal';
import { QueryPostsArgs } from 'src/post/post.dto';
import { EVERT_STATUS, ROLESMAP } from 'src/type';
import { OrderByCondition, Repository } from 'typeorm';
import { OptionalAppraisalField } from './appraisal.dto';

@Controller('appraisal')
export class AppraisalController {
  constructor(
    @InjectRepository(Appraisal)
    private readonly AppraisalRepository: Repository<Appraisal>,
  ) {}

  @Post()
  @ExRoles([ROLESMAP.Blocked])
  create(@Body() params: OptionalAppraisalField, @Req() { user }) {
    return this.AppraisalRepository.create({
      creator: user.userId,
      ...params,
    }).save();
  }

  @Public()
  @Get('list')
  async list(@Query() body: QueryPostsArgs) {
    const rep = this.AppraisalRepository.createQueryBuilder('a');
    const { offset = 0, limit = 15, title, sort, creatorId } = body;
    const _sort: OrderByCondition = {};

    switch (sort) {
      case 'hot':
        _sort['a.view'] = 'DESC';

      // TODO:
      // _sort['p.liker'] = 'DESC';
      // _sort['p.comments'] = 'DESC';
      default:
        break;
    }
    _sort['a.createdAt'] = 'DESC'; // 就近原则

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
      .loadRelationCountAndMap('a.commentCount', 'a.comments', 'cm')
      .loadRelationCountAndMap('a.likerCount', 'a.liker', 'l');

    const raw = await qb
      .skip(offset * limit)
      .take(limit)
      .orderBy(_sort)
      .getMany();

    return { code: 200, data: raw };
  }

  @Get(':id')
  async getPostById(@Param('id') id: string) {
    const appraisal = await this.AppraisalRepository.createQueryBuilder('a')
      .where('a.id = :pid', { pid: id })
      .leftJoinAndSelect('a.creator', 'u')
      .leftJoin('a.bindPost', 'p')
      .loadRelationCountAndMap('a.commentCount', 'p.comments', 'cm')
      .loadRelationCountAndMap('a.likerCount', 'a.liker', 'l')
      .getOne();

    if (!appraisal) return { code: 404 };

    const { rate } = await this.AppraisalRepository.createQueryBuilder('a')
      .select(['a.rate'])
      .where('bindPostId = :id', { id: appraisal.bindPost })
      .select('AVG(a.rate)', 'rate')
      .getRawOne<{ rate: string }>();

    appraisal.bindPost.rate = rate ? parseInt(rate) : 0;

    return { code: 200, data: appraisal };
  }
}
