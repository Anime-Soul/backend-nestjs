import { Request } from 'express';

export type IResponse<T> = Promise<{
  code: number;
  message?: string;
  data?: T;
}>;

export const ROLESMAP = {
  ROOT: 0,
  ADMIN: 1,
  WRITER: 2,
  HUMAN: 3,
  Blocked: 4,
};

export class ListDto {
  limit?: number;
  offset?: number;
}

export interface JWT_USER_INFO {
  userId: string;
  status: number;
  email: string;
  username: string;
  role: number;
}

export interface IReq extends Request {
  user: JWT_USER_INFO;
}

export enum POST_TYPE {
  VIDEO = 0,
  POST = 1,
}

export enum EVERT_STATUS {
  OK = 1,
  BLOCKED = 0,
  DELECTED = -1,
}
