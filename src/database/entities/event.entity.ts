import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TransactionEntity } from './transaction.entity';
import { UserEntity } from './user.entity';

@Entity('events')
@Index('IDX_events_user_date', ['userId', 'date'])
export class EventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.events, { onDelete: 'CASCADE' })
  user: UserEntity;

  @Column({ type: 'datetime' })
  date: Date;

  @Column({ name: 'event_name', length: 120 })
  eventName: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  site?: string | null;

  @Column({ type: 'text', nullable: true })
  memo?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => TransactionEntity, (transaction) => transaction.event)
  transaction?: TransactionEntity | null;
}
