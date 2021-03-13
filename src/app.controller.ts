import { Controller, Post, Req, Res } from '@nestjs/common';
import { Public } from './common/decorators/auth.decorator';
import wasm from './wasm';

@Controller('/')
export class AppController {
  @Public()
  @Post()
  wasm(@Req() req, @Res() res) {
    return wasm(req, res);
  }
}
