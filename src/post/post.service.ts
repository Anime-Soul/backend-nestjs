import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Post from '../entity/Post';
import { Repository } from 'typeorm';
import { CreatePostArgs } from './post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async create({ creatorId, ...options }: CreatePostArgs & { creatorId }) {
    const post = await this.postRepository
      .create({
        creator: creatorId,
        ...options,
      })
      .save();
    return { code: HttpStatus.CREATED, data: post };
  }

  async glance(id: string) {
    const v = await this.postRepository.findOne(id, { select: ['view'] });
    await this.postRepository.update(id, { view: v.view + 1 });
    return { code: 200 };
  }
}
