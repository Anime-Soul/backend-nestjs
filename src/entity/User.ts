import { ROLESMAP } from 'src/type';
import { Column, Entity, OneToMany } from 'typeorm';
import Appraisal from './Appraisal';
import Post from './Post';
import _BaseEntity from './_BaseEntity';

@Entity()
export default class User extends _BaseEntity {
  @Column({ default: ROLESMAP.READER, type: 'tinyint' })
  roleLevel: number;

  @Column({ nullable: true })
  resetPWDToken?: string;

  @Column({ length: 8, unique: true, nullable: true })
  username?: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  token?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true, length: 15 })
  bio?: string;

  @OneToMany(() => Post, (post) => post.creator)
  posts?: Post[];

  @OneToMany(() => Appraisal, (appraisal) => appraisal.creator)
  appraisals?: Appraisal[];
}
