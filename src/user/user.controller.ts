import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common';
import { ValidationPipe } from '../common/pipes/validation.pipe';
import { Public } from 'src/common/decorators/auth.decorator';
import { SignInDto, SignUpDto, UpdateUserDto } from './user.dto';
import { UserService } from './user.service';
import { IReq, ROLESMAP } from 'src/type';
import RegCode from 'src/entity/RegCode';
import * as crypto from 'crypto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @UsePipes(new ValidationPipe())
  @Post('signup')
  async signup(@Body() body: SignUpDto) {
    return this.userService.signup(body);
  }

  @Public()
  @Post('signin')
  signin(@Body() signinParams: any) {
    return this.userService.signin(signinParams);
  }

  @Public()
  @Post('app')
  async siginInOrRegister(@Body() param: SignInDto) {
    if (await this.userService.findOneByEmail(param.email)) {
      return this.signin({ email: param.email, password: param.password });
    }
    return this.userService.signup({ repassword: param.password, ...param });
  }

  @Public()
  @Get('query')
  query(@Query() { key, offset = 0, limit = 15 }: any) {
    return this.userService.query(key, offset, limit);
  }

  @Get(':username')
  async queryByEmail(@Param('username') username) {
    const u = await this.userService.findOneByUsername(username);

    return { code: u ? 200 : 404, data: u || null };
  }

  // @Patch()
  // async update(@Body() { id, ...params }: UpdateUserDto, @Req() { user }) {
  //   if (id && id !== user.userId && user.role > ROLESMAP.ADMIN)
  //     throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  //   return this.userService.update({ id: id || user.userId, ...params });
  // }

  @Patch()
  async update(@Body() { id, ...params }: UpdateUserDto, @Req() { user }) {
    if (id && id !== user.userId && user.role > ROLESMAP.ADMIN)
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    const _id = id || user.userId;
    const u = await this.userService.findOne(_id);

    return this.userService.update({ id: _id, ...u, ...params });
  }

  @Get('me')
  async me(@Req() { user }, @Body() id: string) {
    const m = await this.userService.findOne(id || user.userId);
    return { code: m ? 200 : 404, data: m };
  }

  @Get('gen-code')
  async genCode(@Req() { user }: IReq, @Query('num') num: number) {
    if (user.role != ROLESMAP.ROOT) {
      return new UnauthorizedException();
    }
    const list = [];
    for (let index = 0; index < num; index++) {
      list.push(
        (
          await RegCode.create({
            status: 0,
            code: crypto.randomBytes(8).toString(),
          }).save()
        ).id,
      );
    }

    return list;
  }
}
