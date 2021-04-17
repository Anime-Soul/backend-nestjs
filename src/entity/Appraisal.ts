import { Column, Entity, ManyToOne } from 'typeorm';
import Post from './Post';
import User from './User';
import _BaseEntity from './_BaseEntity';

@Entity()
export default class Appraisal extends _BaseEntity {
  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'tinyint' })
  rate: number;

  @ManyToOne(() => Post, (post) => post.appraisals, {
    onDelete: 'SET NULL',
  })
  bindPost: Post;

  @ManyToOne(() => User, (user) => user.appraisals, {
    onDelete: 'SET NULL',
  })
  creator: User;
}
