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
  READER: 4,
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
