import { HttpException, HttpStatus } from '@nestjs/common';
import { QueryError } from 'mysql2';

export const SqlQueryErrorRes = (_: QueryError) => {
  if (_.code === 'ER_DUP_ENTRY' || _.errno === 1062) {
    throw new HttpException('Duplicates of something', HttpStatus.BAD_REQUEST);
  }
  throw new HttpException(_.message, HttpStatus.BAD_REQUEST);
};
