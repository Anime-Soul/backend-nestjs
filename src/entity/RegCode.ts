import {
  BaseEntity,
  Column,
  CreateDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import User from './User';

export default class extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'tinyint', default: 0 }) // 0 正常 -1 block
  status: number;

  @Column()
  code: string;

  @ManyToOne(() => User, (u) => u.regCode, {
    onDelete: 'CASCADE',
  })
  ower: User;
}
