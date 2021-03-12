import { IsNotEmpty, MaxLength } from 'class-validator';

export class CategoryDto {
  @IsNotEmpty()
  @MaxLength(12)
  name: string;

  @IsNotEmpty()
  @MaxLength(36)
  description: string;
}

export class CategoryUpdateDto {
  @IsNotEmpty()
  id: string;

  @MaxLength(12)
  name?: string;

  @MaxLength(36)
  description?: string;
}
