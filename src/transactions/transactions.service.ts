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
      throw new NotFoundException('인물을 찾을 수 없습니다.');
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
      throw new BadRequestException('인물 ID, 이벤트 ID, 금액은 필수입니다.');
    }

    const person = await this.peopleRepository.findOne({
      where: { id: payload.personId, userId },
    });
    if (!person) {
      throw new BadRequestException('유효하지 않은 인물 ID입니다.');
    }

    const event = await this.eventsRepository.findOne({
      where: { id: payload.eventId, userId },
    });
    if (!event) {
      throw new BadRequestException('유효하지 않은 이벤트 ID입니다.');
    }

    const existingTransaction = await this.transactionsRepository.findOne({
      where: { userId, eventId: payload.eventId },
    });
    if (existingTransaction) {
      throw new BadRequestException('이미 다른 거래내역에 연결된 이벤트입니다.');
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
      throw new NotFoundException('거래내역을 찾을 수 없습니다.');
    }

    if (payload.personId !== undefined) {
      const person = await this.peopleRepository.findOne({
        where: { id: payload.personId, userId },
      });
      if (!person) {
        throw new BadRequestException('유효하지 않은 인물 ID입니다.');
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
        throw new BadRequestException('유효하지 않은 이벤트 ID입니다.');
      }

      const existingTransaction = await this.transactionsRepository.findOne({
        where: { userId, eventId: payload.eventId },
      });
      if (existingTransaction && existingTransaction.id !== transaction.id) {
        throw new BadRequestException('이미 다른 거래내역에 연결된 이벤트입니다.');
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
      throw new NotFoundException('거래내역을 찾을 수 없습니다.');
    }

    await this.transactionsRepository.remove(transaction);
    if (transaction.eventId) {
      await this.eventsRepository.delete({ id: transaction.eventId, userId });
    }
  }
}
