import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import Post from './Post';
import _BaseEntity from './_BaseEntity';

@Entity()
export default class Category extends _BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToMany(() => Post, (p) => p.categories, { nullable: true })
  posts?: Post[];
}
