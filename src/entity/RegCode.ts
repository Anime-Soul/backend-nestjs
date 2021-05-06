import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import User from './User';

@Entity()
export default class RegCode extends BaseEntity {
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
