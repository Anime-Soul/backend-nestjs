import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import Tag from 'src/entity/Tag';
import { ListDto, ROLESMAP } from 'src/type';
import { Repository } from 'typeorm';
import { CreateTagArgs } from './tag.dto';
import { TagService } from './tag.service';

@Controller('tag')
@UseGuards(RolesGuard)
export class TagController {
  constructor(
    private readonly TagService: TagService,
    @InjectRepository(Tag)
    private TagRepository: Repository<Tag>,
  ) {}

  @Get('list')
  list(@Query() { offset, limit }: ListDto) {
    return this.TagRepository.find({
      skip: offset * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  @Post()
  @Roles(ROLESMAP.WRITER, ROLESMAP.ADMIN, ROLESMAP.ROOT)
  async add(@Body() params: CreateTagArgs, @Req() { user }) {
    return {
      code: 201,
      data: (
        await this.TagRepository.create({ creatorId: user.userId, ...params })
      ).save(),
    };
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
}
