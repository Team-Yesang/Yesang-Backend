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
      return this.transactionsRepository.find({ where: { userId, personId } });
    }
    return this.transactionsRepository.find({ where: { userId } });
  }

  async create(
    userId: string,
    payload: CreateTransactionDto,
  ): Promise<TransactionEntity> {
    if (!payload?.personId || payload.amount === undefined || !payload?.date) {
      throw new BadRequestException('personId, amount, date are required');
    }

    const person = await this.peopleRepository.findOne({
      where: { id: payload.personId, userId },
    });
    if (!person) {
      throw new BadRequestException('Invalid personId');
    }

    if (payload.eventId) {
      const event = await this.eventsRepository.findOne({
        where: { id: payload.eventId, userId },
      });
      if (!event) {
        throw new BadRequestException('Invalid eventId');
      }
    }

    const txDate = new Date(payload.date);
    if (Number.isNaN(txDate.getTime())) {
      throw new BadRequestException('Invalid date');
    }

    const transaction = this.transactionsRepository.create({
      id: randomUUID(),
      userId,
      personId: payload.personId,
      eventId: payload.eventId ?? null,
      amount: payload.amount,
      date: txDate,
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

    if (payload.eventId !== undefined) {
      if (payload.eventId) {
        const event = await this.eventsRepository.findOne({
          where: { id: payload.eventId, userId },
        });
        if (!event) {
          throw new BadRequestException('Invalid eventId');
        }
      }
      transaction.eventId = payload.eventId ?? null;
    }

    if (payload.amount !== undefined) {
      transaction.amount = payload.amount;
    }

    if (payload.date !== undefined) {
      const txDate = new Date(payload.date);
      if (Number.isNaN(txDate.getTime())) {
        throw new BadRequestException('Invalid date');
      }
      transaction.date = txDate;
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
  }
}
