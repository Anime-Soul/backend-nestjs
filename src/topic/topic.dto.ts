import { IsNotEmpty } from 'class-validator';

export class OptionalTopicField {
  title?: string;

  subtitle?: string;

  cover?: string;

  type?: number;

  categoriesId?: string[];

  tagsId?: string[];

  @IsNotEmpty()
  content: string;
}

export class SearchTopicDto {
  title?: string;
  content?: string;
}
