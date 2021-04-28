import { Transform } from 'class-transformer';
import { IsNotEmpty, Max, Min } from 'class-validator';

export class OptionalAppraisalField {
  title?: string;

  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  @Max(5)
  @Min(0)
  @Transform((value) => Number.parseInt(value.value))
  rate: number;

  @IsNotEmpty()
  postId: string;
}
