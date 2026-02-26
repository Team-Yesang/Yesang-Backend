import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TransactionEntity } from './transaction.entity';
import { UserEntity } from './user.entity';

@Entity('people')
@Index('IDX_people_user_name', ['userId', 'name'])
export class PersonEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.people, { onDelete: 'CASCADE' })
  user: UserEntity;

  @Column({ length: 80 })
  name: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  tag?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => TransactionEntity, (transaction) => transaction.person)
  transactions: TransactionEntity[];
}
