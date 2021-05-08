import { ROLESMAP } from 'src/type';
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import Appraisal from './Appraisal';
import Post from './Post';
import _BaseEntity from './_BaseEntity';
import Comment from './Comment';
import RegCode from './RegCode';
import { Topic } from './Topic';
@Entity()
export default class User extends _BaseEntity {
  @Column({ default: ROLESMAP.HUMAN, type: 'tinyint' })
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

  @OneToMany(() => Appraisal, (a) => a.creator)
  appraisals?: Appraisal[];

  @OneToMany(() => Comment, (c) => c.creator)
  comments?: Comment[];

  @ManyToMany(() => Post, (up) => up.liker)
  l_post?: Post[];

  @ManyToMany(() => Appraisal, (la) => la.liker)
  l_appraisals?: Appraisal[];

  @OneToMany(() => RegCode, (r) => r.ower)
  regCode: RegCode;

  @OneToMany(() => Topic, (t) => t.creator)
  topics: Topic[];
}
