import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import Tag from './Tag';
import User from './User';
import _BaseEntity from './_BaseEntity';
import Comment from './Comment';
import Post from './Post';

@Entity()
export class Topic extends _BaseEntity {
  @Column({ nullable: true })
  title?: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'int', default: 0 })
  view: number;

  @ManyToOne(() => User, (u) => u.topics, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  creator: User;

  @ManyToMany(() => Tag, (t) => t.topics)
  @JoinTable()
  tags: Tag[];

  @OneToMany(() => Comment, (c) => c.bindTopic)
  comments: Comment[];

  @ManyToMany(() => User, (u) => u.l_post)
  @JoinTable()
  liker: User[];

  @ManyToOne(() => Post, (p) => p.topics, {
    onDelete: 'SET NULL',
  })
  bindPost: Post;
}
