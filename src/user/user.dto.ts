import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

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

  username?: string;

  imei?: string;
}

export class SignInDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @MaxLength(16)
  @MinLength(7)
  @IsNotEmpty()
  password: string;
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
