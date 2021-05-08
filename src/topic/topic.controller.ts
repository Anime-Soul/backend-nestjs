import { Body, Controller, HttpStatus, Post as P, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ROLESMAP } from '../type';
import { ExRoles } from '../common/decorators/roles.decorator';
import Comment from '../entity/Comment';
import { TopicService } from './topic.service';
import { Topic } from 'src/entity/Topic';
import { OptionalTopicField } from './topic.dto';

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
  create(@Body() params: OptionalTopicField, @Req() { user }) {
    return {
      code: HttpStatus.CREATED,
      data: this.topicRepository
        .create({
          creator: { id: user.userId },
          ...params,
        })
        .save(),
    };
  }
}
