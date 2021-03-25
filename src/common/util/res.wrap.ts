import { HttpStatus } from '@nestjs/common';
import { isArray } from 'class-validator';

export default (data: Record<string, any> | [], code = -1, msg: string) => {
  if (code == -1) {
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
  }
  return {
    code,
    data,
    message: msg,
  };
};
