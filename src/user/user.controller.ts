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
  UsePipes,
} from '@nestjs/common';
import { ValidationPipe } from '../common/pipes/validation.pipe';
import { Public } from 'src/common/decorators/auth.decorator';
import { SignUpDto, UpdateUserDto } from './user.dto';
import { UserService } from './user.service';
import { ROLESMAP } from 'src/type';
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
  @Get('query')
  query(@Query() { key, offset = 0, limit = 15 }: any) {
    return this.userService.query(key, offset, limit);
  }

  @Get(':username')
  async queryByEmail(@Param('username') username) {
    const u = await this.userService.findOneByUsername(username);

    return { code: u ? 200 : 404, data: u || null };
  }

  @Patch()
  async update(@Body() { id, ...params }: UpdateUserDto, @Req() { user }) {
    if (id && id !== user.userId && user.role > ROLESMAP.ADMIN)
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    return this.userService.update({ id: id || user.userId, ...params });
  }

  @Get('me')
  async me(@Req() { user }) {
    const m = await this.userService.findOne(user.userId);
    return { code: m ? 200 : 404, data: m };
  }
}
