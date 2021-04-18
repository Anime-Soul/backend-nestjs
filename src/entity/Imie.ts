import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export default class Imei extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column()
  imei: string;

  @Column()
  userId: string;
}
