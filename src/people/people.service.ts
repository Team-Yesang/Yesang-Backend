import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonEntity, TransactionEntity } from '../database/entities';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

@Injectable()
export class PeopleService {
  constructor(
    @InjectRepository(PersonEntity)
    private readonly peopleRepository: Repository<PersonEntity>,
    @InjectRepository(TransactionEntity)
    private readonly transactionsRepository: Repository<TransactionEntity>,
  ) {}

  async list(userId: string) {
    const people = await this.peopleRepository.find({ where: { userId } });
    if (people.length === 0) return [];

    const transactions = await this.transactionsRepository.find({ where: { userId } });

    return people.map((person) => {
      const balance = transactions
        .filter((tx) => tx.personId === person.id)
        .reduce((sum, tx) => sum + tx.amount, 0);
      return {
        id: person.id,
        name: person.name,
        relationship: person.relationship,
        tag: person.tag,
        memo: person.memo,
        balance,
      };
    });
  }

  async listRecent(userId: string, limit = 5) {
    const people = await this.peopleRepository.find({ where: { userId } });
    if (people.length === 0) return [];

    const transactions = await this.transactionsRepository.find({ where: { userId } });
    const lastTransactionByPerson = new Map<string, Date>();

    for (const tx of transactions) {
      const existing = lastTransactionByPerson.get(tx.personId);
      if (!existing || tx.date > existing) {
        lastTransactionByPerson.set(tx.personId, tx.date);
      }
    }

    return people
      .map((person) => ({
        id: person.id,
        name: person.name,
        relationship: person.relationship,
        tag: person.tag,
        memo: person.memo,
        lastTransactionAt: lastTransactionByPerson.get(person.id) ?? null,
      }))
      .filter((person) => person.lastTransactionAt !== null)
      .sort(
        (a, b) =>
          (b.lastTransactionAt?.getTime() ?? 0) -
          (a.lastTransactionAt?.getTime() ?? 0),
      )
      .slice(0, limit);
  }

  async getById(userId: string, id: string) {
    const person = await this.peopleRepository.findOne({
      where: { id, userId },
    });

    if (!person) {
      throw new NotFoundException('Person not found');
    }

    const transactions = await this.transactionsRepository.find({
      where: { userId, personId: person.id },
    });

    const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    return {
      id: person.id,
      name: person.name,
      relationship: person.relationship,
      tag: person.tag,
      memo: person.memo,
      transactions,
      summary: {
        count: transactions.length,
        totalAmount,
      },
    };
  }

  async create(userId: string, payload: CreatePersonDto): Promise<PersonEntity> {
    if (!payload?.name) {
      throw new BadRequestException('name is required');
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
      throw new NotFoundException('Person not found');
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
      throw new NotFoundException('Person not found');
    }

    await this.peopleRepository.remove(person);
  }
}
