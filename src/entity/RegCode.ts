import {
  BaseEntity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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
}
