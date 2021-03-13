import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Post from '../entity/Post';
import Category from '../entity/Category';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Post])],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
