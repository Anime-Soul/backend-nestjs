import { Column, Entity, ManyToOne } from 'typeorm';
import Post from './Post';
import _BaseEntity from './_BaseEntity';

@Entity()
export default class Video extends _BaseEntity {
  @Column()
  title: string;

  @Column()
  playUrl: string;

  @Column()
  episode: number;

  @Column({ nullable: true })
  subtitle?: string;

  @Column({ nullable: true })
  cover?: string;

  @ManyToOne(() => Post, (post) => post.videos)
  bindPost?: Post;
}
