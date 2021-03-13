import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post as P,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import Post from 'src/entity/Post';
import Tag from 'src/entity/Tag';
import { ListDto, ROLESMAP } from 'src/type';
import { Repository } from 'typeorm';
import { CreateTagArgs, PostInTagDto } from './tag.dto';
import { TagService } from './tag.service';

@Controller('tag')
@UseGuards(RolesGuard)
export class TagController {
  constructor(
    private readonly TagService: TagService,
    @InjectRepository(Tag)
    private TagRepository: Repository<Tag>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  //todo key search
  @Get('list')
  list(@Body() { offset, limit }: ListDto) {
    return this.TagRepository.find({
      skip: offset * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  @P()
  @Roles(ROLESMAP.WRITER, ROLESMAP.ADMIN, ROLESMAP.ROOT)
  async add(@Body() params: CreateTagArgs, @Req() { user }) {
    const tag = await this.TagRepository.create({
      creatorId: user.userId,
      ...params,
    }).save();
    return { code: 201, data: tag };
  }

  @Delete(':id')
  @Roles(ROLESMAP.WRITER, ROLESMAP.ADMIN, ROLESMAP.ROOT)
  async delect(@Param('id') id) {
    await this.TagRepository.update(id, { status: -1 });
    return { code: 204, data: id };
  }

  @Patch('id')
  @Roles(ROLESMAP.WRITER, ROLESMAP.ADMIN, ROLESMAP.ROOT)
  async update(@Body() { id, ...params }: any) {
    return this.TagRepository.update(id, params)
      .then((_) =>
        _.affected < 1 ? { code: 404, msg: 'Nothing happened' } : { code: 201 },
      )
      .catch((_) => ({ code: 500, msg: _ }));
  }

  @Get(':id/posts')
  posts(@Param() { id, offset = 0, limit = 15 }: PostInTagDto) {
    return this.postRepository
      .createQueryBuilder('p')
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .from('post_tags_tag', 'pt')
          .select('pt.postId')
          .where('pt.tagId = :tagId')
          .getQuery();
        return 'p.id in ' + subQuery;
      })
      .setParameter('tagId', id)
      .skip(offset * limit)
      .take(limit)
      .getMany();
  }
}
