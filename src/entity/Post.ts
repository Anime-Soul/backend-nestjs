import {
  AfterLoad,
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

  rate: number;

  @AfterLoad()
  calcAppr() {
    // post 的 appraisals 走单独接口查询
    if (this.appraisals && this.appraisals.length) {
      this.rate =
        this.appraisals.reduce((_, __) => _ + __.rate, 0) /
        this.appraisals.length;
      delete this.appraisals;
    }
    // post 每加载一个 relation 会走一遍这里 所有使用上次加载 appraisal 时的数据
    this.rate = this.rate > 0 ? this.rate : 0;
  }

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
