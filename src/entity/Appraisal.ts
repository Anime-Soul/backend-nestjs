import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import Post from './Post';
import User from './User';
import _BaseEntity from './_BaseEntity';
import Comment from './Comment';

@Entity()
export default class Appraisal extends _BaseEntity {
  @Column({ type: 'varchar', nullable: true })
  title?: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'tinyint' })
  rate: number;

  @Column({ type: 'tinyint', default: 0 })
  isWatched: number;

  @ManyToOne(() => Post, (post) => post.appraisals, {
    onDelete: 'SET NULL',
  })
  bindPost: Post;

  @ManyToOne(() => User, (user) => user.appraisals, {
    onDelete: 'SET NULL',
  })
  creator: User;

  @OneToMany(() => Comment, (comment) => comment.bindAppraisal)
  comments?: Comment[];

  @ManyToMany(() => User, (u) => u.l_appraisals)
  @JoinTable()
  liker?: User[];
}
