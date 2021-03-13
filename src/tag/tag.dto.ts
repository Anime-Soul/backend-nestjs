import { IsNotEmpty } from 'class-validator';
import { ListDto } from '../type';
export class CreateTagArgs {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description?: string;
}

export class EditTagArgs extends CreateTagArgs {
  id: string;
}

export class DelTagArgs {
  tagId: string;

  postId: string;
}

export class PostInTagDto extends ListDto {
  id: string; //tagid
}

export type PostInCategoryDto = PostInTagDto;
