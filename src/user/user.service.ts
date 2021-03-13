import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from 'src/entity/User';
import { Brackets, Repository } from 'typeorm';
import { IResponse } from 'src/type';
import { delAnyUserInfo, SignUpDto, UpdateUserDto } from './user.dto';
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

    const user = await this.findOneByEmail(email);
    if (user) {
      return { code: 400, msg: '用户已存在' };
    }
    const hash = this.authService.hashUserPwd(password);
    const u = await this.usersRepository
      .create({
        email: email,
        password: hash.digest('hex'),
      })
      .save();

    return {
      data: delAnyUserInfo(u),
      code: 201,
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

  findOne(id: string): Promise<User | undefined> {
    return this.usersRepository.findOne(id);
  }

  findOneByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ email });
  }

  findOneByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ username });
  }

  async update({ id, ...param }: UpdateUserDto) {
    const u = await this.findOne(id);
    if (!u) throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    await this.usersRepository.update(id, param);
    return { code: 200, data: id };
  }

  async query(key: string, limit: number, offset: number) {
    return {
      code: 200,
      data: (
        await this.usersRepository
          .createQueryBuilder('u')
          .where('u.status = :status', { status: 0 })
          .andWhere(
            new Brackets((_) => {
              _.where('u.username like :username', {
                username: `%${key}%`,
              }).orWhere('u.email like :email', { email: `%${key}%` });
            }),
          )
          .skip(offset * limit)
          .take(limit)
          .getMany()
      ).map(delAnyUserInfo),
    };
  }
}
