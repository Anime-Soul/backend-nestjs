import { IsNotEmpty } from 'class-validator';

export class OptionalTopicField {
  title?: string;

  postId?: string;

  @IsNotEmpty()
  content: string;
}

export class SearchTopicDto {
  title?: string;
  content?: string;
}
