import { Transform } from 'class-transformer';
import { IsNotEmpty, Length, Max, Min } from 'class-validator';

export class OptionalAppraisalField {
  @IsNotEmpty()
  @Length(4, 20)
  title: string;

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
