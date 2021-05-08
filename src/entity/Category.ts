import { Column, Entity, ManyToMany } from 'typeorm';
import Post from './Post';
import _BaseEntity from './_BaseEntity';

@Entity()
export default class Category extends _BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  creatorId: string;

  @ManyToMany(() => Post, (p) => p.categories)
  posts: Post[];
}
