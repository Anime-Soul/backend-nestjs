import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import Post from './Post';
import User from './User';
import _BaseEntity from './_BaseEntity';

@Entity()
export default class Category extends _BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  creatorId: string;

  @ManyToMany(() => Post, (p) => p.categories, { nullable: true })
  posts?: Post[];
}
