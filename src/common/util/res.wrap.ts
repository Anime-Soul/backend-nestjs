import { HttpStatus } from '@nestjs/common';
import { isArray } from 'class-validator';

export const done = (
  data: Record<string, any> | [],
  msg: string,
  code = HttpStatus.OK,
) => {
  if (!!data) {
    if (isArray(data)) {
      if (data.length > 0) {
        code = HttpStatus.OK;
      } else {
        code = HttpStatus.NOT_FOUND;
      }
    }
  } else {
    code = HttpStatus.NOT_FOUND;
  }
  return { code, data, message: msg };
};

export const fail = (message = '', code = 400, error = 'Bad Request') => ({
  statusCode: code,
  message: [message],
  error: error,
});
