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

export class QueryPostsArgs {
  id?: string;

  title?: string;

  type?: number;

  creatorId?: string;

  categoriesId?: string[];

  tagsId?: string[];

  offset?: number;

  limit?: number;
}
