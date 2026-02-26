import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { EventEntity, PersonEntity, TransactionEntity } from '../database/entities';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventsRepository: Repository<EventEntity>,
    @InjectRepository(TransactionEntity)
    private readonly transactionsRepository: Repository<TransactionEntity>,
    @InjectRepository(PersonEntity)
    private readonly peopleRepository: Repository<PersonEntity>,
  ) {}

  async listByMonth(userId: string, year?: number, month?: number) {
    if (!year || !month) {
      return this.eventsRepository.find({ where: { userId } });
    }

    const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    return this.eventsRepository.find({
      where: { userId, date: Between(start, end) },
      order: { date: 'ASC' },
    });
  }

  async getById(userId: string, id: string) {
    const event = await this.eventsRepository.findOne({
      where: { id, userId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const transactions = await this.transactionsRepository.find({
      where: { userId, eventId: event.id },
    });

    const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const personIds = Array.from(new Set(transactions.map((tx) => tx.personId)));
    const people =
      personIds.length > 0
        ? await this.peopleRepository.findBy({ id: In(personIds) })
        : [];
    const byPerson = people.map((person) => ({
      personId: person.id,
      name: person.name,
      totalAmount: transactions
        .filter((tx) => tx.personId === person.id)
        .reduce((sum, tx) => sum + tx.amount, 0),
    }));

    return {
      ...event,
      transactions,
      summary: {
        totalAmount,
        byPerson,
      },
    };
  }

  async create(userId: string, payload: CreateEventDto): Promise<EventEntity> {
    if (!payload?.date || !payload?.eventName) {
      throw new BadRequestException('date and eventName are required');
    }

    const eventDate = new Date(payload.date);
    if (Number.isNaN(eventDate.getTime())) {
      throw new BadRequestException('Invalid date');
    }

    const event = this.eventsRepository.create({
      id: randomUUID(),
      userId,
      date: eventDate,
      eventName: payload.eventName,
      site: payload.site ?? null,
      memo: payload.memo ?? null,
    });

    return this.eventsRepository.save(event);
  }

  async update(
    userId: string,
    id: string,
    payload: UpdateEventDto,
  ): Promise<EventEntity> {
    const event = await this.eventsRepository.findOne({
      where: { id, userId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (payload.date !== undefined) {
      const eventDate = new Date(payload.date);
      if (Number.isNaN(eventDate.getTime())) {
        throw new BadRequestException('Invalid date');
      }
      event.date = eventDate;
    }

    if (payload.eventName !== undefined) {
      event.eventName = payload.eventName;
    }

    if (payload.site !== undefined) {
      event.site = payload.site ?? null;
    }

    if (payload.memo !== undefined) {
      event.memo = payload.memo ?? null;
    }

    return this.eventsRepository.save(event);
  }

  async remove(userId: string, id: string): Promise<void> {
    const event = await this.eventsRepository.findOne({
      where: { id, userId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    await this.transactionsRepository.update(
      { userId, eventId: id },
      { eventId: null },
    );
    await this.eventsRepository.remove(event);
  }
}
