import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class ExceptionFilterFilter<HttpException> implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const status = exception.getStatus();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const exceptionRes: any = exception.getResponse();
    const { error, message } = exceptionRes;

    const msgLog = {
      status,
      code: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error,
      message,
    };

    response.status(status).send(msgLog);
  }
}
