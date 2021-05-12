import { Controller, Post, Req, Res } from '@nestjs/common';
import { Public } from './common/decorators/auth.decorator';
import type { Request, Response } from 'express';
import wasm from './wasm';

@Controller('/')
export class AppController {
  @Public()
  @Post('wasm')
  wasm(@Req() req: Request, @Res() res: Response) {
    return wasm(req, res);
  }
}
