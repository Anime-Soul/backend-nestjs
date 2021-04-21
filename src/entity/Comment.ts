import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import User from './User';
import _BaseEntity from './_BaseEntity';
import Post from './Post';

@Entity()
export default class Comment extends _BaseEntity {
  @ManyToOne(() => User, (user) => user.comments)
  creator: User;

  @ManyToOne(() => Post, (p) => p.comments)
  bindPost: Post;

  @Column()
  content: string;

  @OneToMany(() => Comment, (c) => c.children)
  children?: Comment;

  @ManyToOne(() => Comment, (c) => c.children)
  parent?: Comment;
}
