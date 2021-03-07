import { IsNotEmpty } from 'class-validator';

export class SignUpDto {
  @IsNotEmpty({ message: 'email NotEmpty' })
  email: string;
  @IsNotEmpty({ message: 'password NotEmpty' })
  password: string;
  @IsNotEmpty({ message: 'repassword NotEmpty' })
  repassword: string;
}

export class UpdateUserDto {
  id: string;
  email: string;
  username?: string;
  avatar?: string;
  bio?: string;
}
