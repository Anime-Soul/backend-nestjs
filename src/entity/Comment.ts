import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import User from './User';
import _BaseEntity from './_BaseEntity';
import Post from './Post';
import Appraisal from './Appraisal';

@Entity()
export default class Comment extends _BaseEntity {
  @ManyToOne(() => User, (user) => user.comments, {
    onDelete: 'SET NULL',
  })
  creator: User;

  @ManyToOne(() => Post, (p) => p.comments, {
    onDelete: 'SET NULL',
  })
  bindPost: Post;

  @Column()
  content: string;

  @OneToMany(() => Comment, (c) => c.children)
  children?: Comment;

  @ManyToOne(() => Comment, (c) => c.children, {
    onDelete: 'SET NULL',
  })
  parent?: Comment;

  @ManyToOne(() => Appraisal, (a) => a.comments, {
    onDelete: 'SET NULL',
  })
  bindAppraisal?: Appraisal[];
}
