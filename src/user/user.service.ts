import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from 'src/entity/User';
import { Repository } from 'typeorm';
import { IResponse } from 'src/type';
import { SignUpDto, UpdateUserDto } from './user.dto';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly authService: AuthService,
  ) {}

  async signup(param: SignUpDto): IResponse<User> {
    const { email, password, repassword } = param;

    if (password !== repassword) {
      return { code: 400, msg: '两次密码输入不一致' };
    }

    const user = await this.findOne(email);
    if (user) {
      return { code: 400, msg: '用户已存在' };
    }
    const hash = this.authService.hashUserPwd(password);
    return {
      data: await this.usersRepository
        .create({
          email: email,
          password: hash.digest('hex'),
        })
        .save(),
      code: 200,
    };
  }

  async signin({ email, password }) {
    const user = await this.findOneByEmail(email);
    if (user) {
      const authResult = this.authService.validateUserPwd(
        password,
        user.password,
      );
      if (authResult) {
        return this.authService.certificate(user);
      } else {
        return { code: 403, msg: 'login error' };
      }
    } else {
      return { code: 404 };
    }
  }

  async findOne(id: string): Promise<User | undefined> {
    return this.usersRepository.findOne(id);
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ email });
  }

  update({ id, ...param }: UpdateUserDto) {
    this.usersRepository.update(id, param);
    return { code: 200, data: id };
  }
}
