import { Column, Entity, ManyToMany } from 'typeorm';
import Post from './Post';
import { Topic } from './Topic';
import _BaseEntity from './_BaseEntity';

@Entity()
export default class Tag extends _BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  creatorId: string;

  @ManyToMany(() => Post, (p) => p.tags)
  posts: Post[];

  @ManyToMany(() => Topic, (t) => t.tags)
  topics: Topic[];
}
