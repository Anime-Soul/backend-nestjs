// import { CreateVideoArgsWithPost } from './video.arg';

import { IsNotEmpty } from 'class-validator';

class OptionalPostField {
  @IsNotEmpty()
  title: string;

  subtitle?: string;

  cover?: string;

  type?: number;

  categoriesId?: string[];

  tagsId?: string[];

  @IsNotEmpty()
  content: string;
}

export class CreatePostArgs extends OptionalPostField {
  // videos?: CreateVideoArgsWithPost[];
}

export class UpdatePostArgs {
  title: string;

  subtitle?: string;

  content?: string;

  cover?: string;

  type?: number;

  id: string;
}

class QueryPostWhere {
  title?: string;

  type?: number;

  sort?: string;

  creatorId?: string;
}
export class QueryPostsArgs extends QueryPostWhere {
  offset?: number;

  limit?: number;
}

export class CommentDto {
  @IsNotEmpty()
  content: string;

  parent?: string;
}
