import {
  Body,
  Controller,
  Get,
  Post as P,
  Delete,
  Param,
  Patch,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import Category from 'src/entity/Category';
import Post from 'src/entity/Post';
import { PostInCategoryDto } from 'src/tag/tag.dto';
import { ListDto, ROLESMAP } from 'src/type';
import { Repository } from 'typeorm';
import { CategoryDto, CategoryUpdateDto } from './category.dto';
import { CategoryService } from './category.service';

@Controller('category')
@UseGuards(RolesGuard)
export class CategoryController {
  constructor(
    private readonly CategoryService: CategoryService,
    @InjectRepository(Category)
    private CategoryRepository: Repository<Category>,
    @InjectRepository(Post)
    private PostRepository: Repository<Post>,
  ) {}

  @P()
  @Roles(ROLESMAP.WRITER, ROLESMAP.ADMIN, ROLESMAP.ROOT)
  async add(@Body() params: CategoryDto, @Req() { user }) {
    return {
      code: 201,
      data: await this.CategoryRepository.create({
        creatorId: user.userId,
        ...params,
      }).save(),
    };
  }

  @Get('list')
  list(@Query() { offset = 0, limit = 15 }: ListDto) {
    return this.CategoryRepository.find({
      skip: offset * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  @Delete(':id')
  @Roles(ROLESMAP.WRITER, ROLESMAP.ADMIN, ROLESMAP.ROOT)
  async delete(@Param('id') id: number) {
    await this.CategoryRepository.update(id, { status: -1 })
      .then((_) =>
        _.affected < 1 ? { code: 404, msg: 'Nothing happened' } : { code: 201 },
      )
      .catch((_) => ({ code: 500, msg: _ }));
    return { code: 204, data: id };
  }

  @Patch()
  @Roles(ROLESMAP.WRITER, ROLESMAP.ADMIN, ROLESMAP.ROOT)
  async update(@Body() { id, ...params }: CategoryUpdateDto) {
    return this.CategoryRepository.update(id, params)
      .then((_) =>
        _.affected < 1 ? { code: 404, msg: 'Nothing happened' } : { code: 201 },
      )
      .catch((_) => ({ code: 500, msg: _ }));
  }

  @Get(':id/posts')
  posts(@Param() { id, offset = 0, limit = 15 }: PostInCategoryDto) {
    return this.PostRepository.createQueryBuilder('p')
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .from('post_categories_category', 'pc')
          .select('pc.postId')
          .where('pc.categoryId = :categoryId')
          .getQuery();
        return 'p.id in ' + subQuery;
      })
      .setParameter('categoryId', id)
      .skip(offset * limit)
      .take(limit)
      .getMany();
  }
}
