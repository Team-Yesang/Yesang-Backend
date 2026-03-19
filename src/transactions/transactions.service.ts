import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEntity, PersonEntity, TransactionEntity } from '../database/entities';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionsRepository: Repository<TransactionEntity>,
    @InjectRepository(PersonEntity)
    private readonly peopleRepository: Repository<PersonEntity>,
    @InjectRepository(EventEntity)
    private readonly eventsRepository: Repository<EventEntity>,
  ) {}

  async list(userId: string, personId?: string) {
    if (personId) {
      return this.transactionsRepository.find({
        where: { userId, personId },
        order: { date: 'DESC' },
      });
    }
    return this.transactionsRepository.find({
      where: { userId },
      order: { date: 'DESC' },
    });
  }

  async listByPerson(userId: string, personId: string) {
    const person = await this.peopleRepository.findOne({
      where: { id: personId, userId },
    });
    if (!person) {
      throw new NotFoundException('Person not found');
    }

    const transactions = await this.transactionsRepository.find({
      where: { userId, personId },
      order: { date: 'DESC' },
    });

    const balance = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const latestAmount = transactions.length > 0 ? transactions[0].amount : null;

    return {
      balance,
      latestAmount,
      transactions: transactions.map((tx) => ({
        id: tx.id,
        personId: tx.personId,
        eventId: tx.eventId,
        amount: tx.amount,
        date: tx.date.toISOString().split('T')[0],
        memo: tx.memo,
      })),
    };
  }

  async create(
    userId: string,
    payload: CreateTransactionDto,
  ): Promise<TransactionEntity> {
    if (!payload?.personId || !payload?.eventId || payload.amount === undefined) {
      throw new BadRequestException('personId, eventId, amount are required');
    }

    const person = await this.peopleRepository.findOne({
      where: { id: payload.personId, userId },
    });
    if (!person) {
      throw new BadRequestException('Invalid personId');
    }

    const event = await this.eventsRepository.findOne({
      where: { id: payload.eventId, userId },
    });
    if (!event) {
      throw new BadRequestException('Invalid eventId');
    }

    const existingTransaction = await this.transactionsRepository.findOne({
      where: { userId, eventId: payload.eventId },
    });
    if (existingTransaction) {
      throw new BadRequestException('This event is already linked to another transaction');
    }

    const transaction = this.transactionsRepository.create({
      id: randomUUID(),
      userId,
      personId: payload.personId,
      eventId: event.id,
      amount: payload.amount,
      date: event.date,
      memo: payload.memo ?? null,
    });

    return this.transactionsRepository.save(transaction);
  }

  async update(
    userId: string,
    id: string,
    payload: UpdateTransactionDto,
  ): Promise<TransactionEntity> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id, userId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (payload.personId !== undefined) {
      const person = await this.peopleRepository.findOne({
        where: { id: payload.personId, userId },
      });
      if (!person) {
        throw new BadRequestException('Invalid personId');
      }
      transaction.personId = payload.personId;
    }

    if (payload.amount !== undefined) {
      transaction.amount = payload.amount;
    }

    if (payload.eventId !== undefined) {
      const event = await this.eventsRepository.findOne({
        where: { id: payload.eventId, userId },
      });
      if (!event) {
        throw new BadRequestException('Invalid eventId');
      }

      const existingTransaction = await this.transactionsRepository.findOne({
        where: { userId, eventId: payload.eventId },
      });
      if (existingTransaction && existingTransaction.id !== transaction.id) {
        throw new BadRequestException('This event is already linked to another transaction');
      }

      transaction.eventId = event.id;
      transaction.date = event.date;
    }

    if (payload.memo !== undefined) {
      transaction.memo = payload.memo ?? null;
    }

    return this.transactionsRepository.save(transaction);
  }

  async remove(userId: string, id: string): Promise<void> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id, userId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    await this.transactionsRepository.remove(transaction);
    if (transaction.eventId) {
      await this.eventsRepository.delete({ id: transaction.eventId, userId });
    }
  }
}
