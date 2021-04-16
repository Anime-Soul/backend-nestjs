import { ROLESMAP } from 'src/type';
import { Column, Entity, OneToMany } from 'typeorm';
import Appraisal from './Appraisal';
import Post from './Post';
import _BaseEntity from './_BaseEntity';
import Comment from './Comment';

@Entity()
export default class User extends _BaseEntity {
  @Column({ default: ROLESMAP.READER, type: 'tinyint' })
  roleLevel: number;

  @Column({ nullable: true, select: false })
  resetPWDToken?: string;

  @Column({ length: 12, unique: true, nullable: true })
  username?: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true, select: false })
  token?: string;

  @Column({
    nullable: true,
    default:
      'https://ae01.alicdn.com/kf/Hfa4561650386480f884450d0eb82a3eaZ.png',
  })
  avatar?: string;

  @Column({ nullable: true, type: 'varchar', default: 'WHAT"S ANIMESOUL ?' })
  bio?: string;

  @OneToMany(() => Post, (post) => post.creator)
  posts?: Post[];

  @OneToMany(() => Appraisal, (appraisal) => appraisal.creator)
  appraisals?: Appraisal[];

  @OneToMany(() => Comment, (comment) => comment.creator)
  comments?: Comment[];
}
