import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import User from 'src/entity/User';

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @MaxLength(16)
  @MinLength(7)
  @IsNotEmpty()
  password: string;

  @MaxLength(16)
  @MinLength(8)
  @IsNotEmpty()
  repassword: string;
}

// @Transform(value => Number.isNan(+value) ? 0 : +value)
export class UpdateUserDto {
  id?: string;
  email: string;
  username?: string;
  avatar?: string;
  bio?: string;
  // status?: number;
}
