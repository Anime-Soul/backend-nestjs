import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UsePipes,
} from '@nestjs/common';
import { ValidationPipe } from '../common/pipes/validation.pipe';
import { Public } from 'src/common/decorators/auth.decorator';
import { SignUpDto, UpdateUserDto } from './user.dto';
import { UserService } from './user.service';

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
  async signin(@Body() signinParams: any) {
    return await this.userService.signin(signinParams);
  }

  @Post('update')
  update(@Body() params: UpdateUserDto, @Req() { user }) {
    return this.userService.update({ id: user.userId, ...params });
  }

  @Get('me')
  async me(@Req() { user }) {
    const m = await this.userService.findOne(user.userId);
    delete m.password;
    return m;
  }
}
