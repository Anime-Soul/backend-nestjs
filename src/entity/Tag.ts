import { Column, Entity, ManyToMany } from 'typeorm';
import Post from './Post';
import _BaseEntity from './_BaseEntity';

@Entity()
export default class Tag extends _BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToMany(() => Post, (p) => p.tags, { nullable: true })
  posts?: Post[];
}
