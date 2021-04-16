import { HttpException, HttpStatus } from '@nestjs/common';
import { QueryError } from 'mysql2';
import { fail } from './res.wrap';

export const SqlQueryErrorRes = (_: QueryError) => {
  if (_.code === 'ER_DUP_ENTRY' || _.errno === 1062) {
    throw new HttpException(
      fail('Duplicates of something'),
      HttpStatus.BAD_REQUEST,
    );
  }
  throw new HttpException(fail(_.message), HttpStatus.BAD_REQUEST);
};
