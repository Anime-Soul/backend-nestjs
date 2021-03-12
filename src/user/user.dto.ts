import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import User from 'src/entity/User';

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @MaxLength(16)
  @MinLength(8)
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
  status?: number;
}

export const delAnyUserInfo = (u: User) => {
  delete u?.password;
  delete u?.token;
  delete u?.resetPWDToken;
  return u;
};
