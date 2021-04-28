import { Column, Entity, ManyToOne } from 'typeorm';
import Post from './Post';
import _BaseEntity from './_BaseEntity';

@Entity()
export default class Video extends _BaseEntity {
  @Column()
  title: string;

  @Column({ type: 'text' })
  playUrl: string;

  @Column({ type: 'tinyint' })
  episode: number;

  @Column({ nullable: true })
  subtitle?: string;

  @Column({ nullable: true })
  cover?: string;

  @ManyToOne(() => Post, (post) => post.videos, {
    onDelete: 'SET NULL',
  })
  bindPost?: Post;

  @Column({ nullable: true })
  creatorId?: string;
}
