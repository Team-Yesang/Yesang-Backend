import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { EventEntity, PersonEntity, TransactionEntity } from '../database/entities';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

@Injectable()
export class PeopleService {
  constructor(
    @InjectRepository(PersonEntity)
    private readonly peopleRepository: Repository<PersonEntity>,
    @InjectRepository(TransactionEntity)
    private readonly transactionsRepository: Repository<TransactionEntity>,
    @InjectRepository(EventEntity)
    private readonly eventsRepository: Repository<EventEntity>,
  ) {}

  async list(userId: string) {
    const people = await this.peopleRepository.find({ where: { userId } });
    if (people.length === 0) return [];

    const transactions = await this.transactionsRepository.find({
      where: { userId },
      order: { date: 'DESC' },
    });

    return people.map((person) => {
      const personTxs = transactions.filter((tx) => tx.personId === person.id);
      const totalAmount = personTxs.reduce((sum, tx) => sum + tx.amount, 0);
      const latestAmount = personTxs.length > 0 ? personTxs[0].amount : 0;

      return {
        id: person.id,
        name: person.name,
        relationship: person.relationship,
        latestAmount,
        totalAmount,
      };
    });
  }

  async listRecent(userId: string, limit = 10) {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const recentTransactions = await this.transactionsRepository.find({
      where: { userId, date: MoreThanOrEqual(twoWeeksAgo) },
      order: { date: 'DESC' },
    });

    if (recentTransactions.length === 0) return [];

    const personIds = [...new Set(recentTransactions.map((tx) => tx.personId))];
    const people = await this.peopleRepository.findByIds(personIds);

    const allTransactions = await this.transactionsRepository.find({
      where: { userId },
      order: { date: 'DESC' },
    });

    return personIds
      .map((personId) => {
        const person = people.find((p) => p.id === personId);
        if (!person) return null;

        const personTxs = allTransactions.filter((tx) => tx.personId === personId);
        const totalAmount = personTxs.reduce((sum, tx) => sum + tx.amount, 0);
        const latestAmount = personTxs.length > 0 ? personTxs[0].amount : 0;

        return {
          id: person.id,
          name: person.name,
          relationship: person.relationship,
          latestAmount,
          totalAmount,
        };
      })
      .filter((p) => p !== null)
      .slice(0, limit);
  }

  async getById(userId: string, id: string) {
    const person = await this.peopleRepository.findOne({
      where: { id, userId },
    });

    if (!person) {
      throw new NotFoundException('인물을 찾을 수 없습니다.');
    }

    const transactions = await this.transactionsRepository.find({
      where: { userId, personId: person.id },
      relations: ['event'],
      order: { date: 'DESC' },
    });

    const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const givenAmount = transactions
      .filter((tx) => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const receivedAmount = transactions
      .filter((tx) => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      id: person.id,
      name: person.name,
      relationship: person.relationship,
      tag: person.tag,
      memo: person.memo,
      totalAmount,
      givenAmount,
      receivedAmount,
      transactions: transactions.map((tx) => ({
        id: tx.id,
        eventId: tx.eventId ?? null,
        title: tx.event?.eventName || tx.memo || '거래 내역',
        date: tx.date.toISOString().split('T')[0],
        amount: tx.amount,
      })),
    };
  }

  async create(userId: string, payload: CreatePersonDto): Promise<PersonEntity> {
    if (!payload?.name) {
      throw new BadRequestException('이름은 필수입니다.');
    }

    const person = this.peopleRepository.create({
      id: randomUUID(),
      userId,
      name: payload.name,
      relationship: payload.relationship ?? null,
      tag: payload.tag ?? null,
      memo: payload.memo ?? null,
    });

    return this.peopleRepository.save(person);
  }

  async update(
    userId: string,
    id: string,
    payload: UpdatePersonDto,
  ): Promise<PersonEntity> {
    const person = await this.peopleRepository.findOne({
      where: { id, userId },
    });

    if (!person) {
      throw new NotFoundException('인물을 찾을 수 없습니다.');
    }

    if (payload.name !== undefined) person.name = payload.name;
    if (payload.relationship !== undefined) person.relationship = payload.relationship ?? null;
    if (payload.tag !== undefined) person.tag = payload.tag ?? null;
    if (payload.memo !== undefined) person.memo = payload.memo ?? null;

    return this.peopleRepository.save(person);
  }

  async remove(userId: string, id: string): Promise<void> {
    const person = await this.peopleRepository.findOne({
      where: { id, userId },
    });

    if (!person) {
      throw new NotFoundException('인물을 찾을 수 없습니다.');
    }

    const transactions = await this.transactionsRepository.find({
      where: { userId, personId: person.id },
    });
    const eventIds = transactions
      .map((transaction) => transaction.eventId)
      .filter((eventId): eventId is string => Boolean(eventId));

    if (eventIds.length > 0) {
      await this.eventsRepository.delete(eventIds);
    }
    await this.peopleRepository.remove(person);
  }
}
