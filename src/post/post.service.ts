import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Post from '../entity/Post';
import User from '../entity/User';
import { Repository } from 'typeorm';
import { CreatePostArgs } from './post.dto';
import { delAnyUserInfo } from 'src/user/user.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async create({ creatorId, ...options }: CreatePostArgs & { creatorId }) {
    const post = await this.postRepository
      .create({
        creator: await User.findOne(creatorId),
        ...options,
      })
      .save();
    delAnyUserInfo(post.creator);
    return post;
  }
}
