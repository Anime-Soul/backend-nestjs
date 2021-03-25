import { Controller, Get, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Comment from 'src/entity/Comment';
import { Repository } from 'typeorm';

@Controller('comment')
export class CommentController {
  constructor(
    @InjectRepository(Comment)
    private CommentRepository: Repository<Comment>,
  ) {}
}
