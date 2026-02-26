import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EventEntity } from './event.entity';
import { PersonEntity } from './person.entity';
import { UserEntity } from './user.entity';

@Entity('transactions')
@Index('IDX_transactions_user_date', ['userId', 'date'])
@Index('IDX_transactions_person', ['personId'])
@Index('IDX_transactions_event', ['eventId'])
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.transactions, { onDelete: 'CASCADE' })
  user: UserEntity;

  @Column({ name: 'person_id', type: 'uuid' })
  personId: string;

  @ManyToOne(() => PersonEntity, (person) => person.transactions, {
    onDelete: 'CASCADE',
  })
  person: PersonEntity;

  @Column({ name: 'event_id', type: 'uuid', nullable: true })
  eventId?: string | null;

  @ManyToOne(() => EventEntity, (event) => event.transactions, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  event?: EventEntity | null;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'datetime' })
  date: Date;

  @Column({ type: 'text', nullable: true })
  memo?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
