import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import User from './User';
import _BaseEntity from './_BaseEntity';
import Appraisal from './Appraisal';
import { Topic } from './Topic';

@Entity()
export default class Comment extends _BaseEntity {
  @ManyToOne(() => User, (user) => user.comments, {
    onDelete: 'SET NULL',
  })
  creator: User;

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
  bindAppraisal?: Appraisal;

  @ManyToOne(() => Topic, (t) => t.comments, {
    onDelete: 'SET NULL',
  })
  bindTopic?: Topic;
}
