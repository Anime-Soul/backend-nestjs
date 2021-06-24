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
import { POST_TYPE } from 'src/type';
import { Topic } from './Topic';

@Entity()
export default class Post extends _BaseEntity {
  rate: number;
  hasAppr: number;
  isLike: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  subtitle?: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ nullable: true })
  cover?: string; // eg: https://1.png|https://2.png|https://3.png

  @Column({ default: POST_TYPE.VIDEO, type: 'tinyint' })
  type: number;

  @Column({ type: 'int', default: 0 })
  view: number;

  @OneToMany(() => Post, (p) => p.parent)
  children: Post[];

  @ManyToOne(() => Post, (p) => p.children, {
    onDelete: 'SET NULL',
  })
  parent: Post;

  @ManyToOne(() => User, (user) => user.posts, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  creator: User;

  @OneToMany(() => Video, (video) => video.bindPost)
  videos: Video[];

  @OneToMany(() => Appraisal, (appraisals) => appraisals.bindPost)
  appraisals: Appraisal[];
  @ManyToMany(() => Category, (c) => c.posts, { nullable: true })
  @JoinTable()
  categories: Category[];

  @ManyToMany(() => Tag, (t) => t.posts, { nullable: true })
  @JoinTable()
  tags: Tag[];

  @OneToMany(() => Topic, (t) => t.bindPost)
  topics: Topic[];

  @ManyToMany(() => User, (u) => u.l_post)
  @JoinTable()
  liker: User[];
}
