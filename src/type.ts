export type IResponse<T> = Promise<{
  code: number;
  msg?: string;
  data?: T;
}>;

export const ROLESMAP = {
  SUPER_ADMIN: 0,
  ADMIN: 1,
  WRITER: 2,
  HUMAN: 3,
  READER: 4,
};
