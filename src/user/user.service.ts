import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from 'src/entity/User';
import { Brackets, Repository } from 'typeorm';
import { IResponse } from 'src/type';
import { SignUpDto, UpdateUserDto } from './user.dto';
import { AuthService } from 'src/auth/auth.service';
import { SqlQueryErrorRes } from 'src/common/util/sql.error.response';
import Imei from 'src/entity/Imie';
import * as crypto from 'crypto';
import RegCode from 'src/entity/RegCode';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly authService: AuthService,
  ) {}

  async signup(param: SignUpDto): IResponse<User> {
    const { email, password, repassword, imei, username, regCode } = param;

    if (password !== repassword) {
      return { code: 400, message: '两次密码输入不一致' };
    }

    const user = await this.findOneByEmail(email);
    if (user) {
      return { code: 400, message: '用户已存在' };
    }

    if (imei) {
      const raw = await Imei.findOne({
        where: { imei },
        select: ['imei'],
      });
      if (raw?.imei) return { code: 400, message: '请勿重复注册' };
    }

    const hash = this.authService.hashUserPwd(password).digest('hex');
    const u = await this.usersRepository
      .create({
        email: email,
        password: hash,
        username: username || crypto.randomBytes(6).toString('hex'),
      })
      .save();
    if (imei) await Imei.create({ imei: imei, userId: u.id }).save();
    this.genReCode(u.id, 15);
    u.token = this.authService.certificate(u);
    delete u.password;

    return { data: u, code: 201 };
  }

  async signin({ email, password }) {
    const user = await this.usersRepository.findOne({
      where: { email },
      select: [
        'id',
        'password',
        'username',
        'roleLevel',
        'email',
        'avatar',
        'bio',
      ],
    });

    if (user) {
      const authResult = this.authService.validateUserPwd(
        password,
        user.password,
      );
      if (authResult) {
        user.token = this.authService.certificate(user);
        delete user.password;
        return { code: 200, data: user };
      } else {
        return { code: 403, message: '账号或密码错误' };
      }
    } else {
      return { code: 404 };
    }
  }

  certificate(user: User) {
    return this.authService.certificate(user);
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
    return this.usersRepository
      .update(id, param)
      .then(() => ({ code: 200, data: id }))
      .catch(SqlQueryErrorRes);
  }

  async query(key: string, limit: number, offset: number) {
    return {
      code: 200,
      data: await this.usersRepository
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
        .getMany(),
    };
  }

  async genReCode(userId: string, limit: number) {
    const code = [];
    for (let index = 0; index < limit; index++) {
      code.push(
        await RegCode.create({
          status: 0,
          ower: { id: userId },
          code: crypto.randomBytes(8).toString(),
        }).save(),
      );
    }
    return code;
  }
}
