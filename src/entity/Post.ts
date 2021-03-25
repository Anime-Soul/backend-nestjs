import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import Appraisal from './Appraisal';
import Category from './Category';
import Tag from './Tag';
import User from './User';
import Video from './Video';
import _BaseEntity from './_BaseEntity';
import Comment from './Comment';

@Entity()
export default class Post extends _BaseEntity {
  @Column()
  title: string;

  @Column({ nullable: true })
  subtitle?: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ nullable: true })
  cover?: string;

  @Column({ default: 0, type: 'tinyint' })
  type: number; // video 0 or topic 1

  @Column({ type: 'int', default: 0 })
  up: number;

  @Column({ type: 'int', default: 0 })
  view: number;

  @ManyToOne(() => User, (user) => user.posts, { nullable: false })
  creator: User;

  @OneToMany(() => Video, (video) => video.bindPost)
  videos?: Video[];

  @OneToMany(() => Appraisal, (appraisals) => appraisals.bindPost)
  appraisals?: Appraisal[];

  @ManyToMany(() => Category, (c) => c.posts, { nullable: true })
  @JoinTable()
  categories?: Category[];

  @ManyToMany(() => Tag, (t) => t.posts, { nullable: true })
  @JoinTable()
  tags?: Tag[];

  @OneToMany(() => Comment, (comment) => comment.creator)
  comments?: Comment[];
}
