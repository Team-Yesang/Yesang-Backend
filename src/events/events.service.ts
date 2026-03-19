import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { EventEntity, PersonEntity, TransactionEntity } from '../database/entities';
import { CreateEventDto, EventDto } from './dto/create-event.dto';
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
    const events =
      !year || !month
        ? await this.eventsRepository.find({
            where: { userId },
            order: { date: 'ASC' },
          })
        : await this.eventsRepository.find({
            where: {
              userId,
              date: Between(
                new Date(year, month - 1, 1, 0, 0, 0, 0),
                new Date(year, month, 0, 23, 59, 59, 999),
              ),
            },
            order: { date: 'ASC' },
          });

    return this.buildEventResponses(userId, events);
  }

  async listUpcoming(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 14);
    endDate.setHours(23, 59, 59, 999);

    const events = await this.eventsRepository.find({
      where: {
        userId,
        date: Between(today, endDate),
      },
      order: { date: 'ASC' },
    });

    return this.buildEventResponses(userId, events);
  }

  async getById(userId: string, id: string) {
    const event = await this.eventsRepository.findOne({
      where: { id, userId },
    });

    if (!event) {
      throw new NotFoundException('이벤트를 찾을 수 없습니다.');
    }

    const [response] = await this.buildEventResponses(userId, [event]);
    return response;
  }

  async create(userId: string, payload: CreateEventDto): Promise<EventDto> {
    const requestedPersonId = payload?.personId ?? payload?.person;
    if (!payload?.date || !payload?.eventName || !requestedPersonId) {
      throw new BadRequestException('날짜, 이벤트 이름, 인물 ID는 필수입니다.');
    }

    const eventDate = new Date(payload.date);
    if (Number.isNaN(eventDate.getTime())) {
      throw new BadRequestException('올바른 날짜 형식이 아닙니다.');
    }

    const person = await this.peopleRepository.findOne({
      where: { id: requestedPersonId, userId },
    });
    if (!person) {
      throw new BadRequestException('유효하지 않은 인물 ID입니다.');
    }

    const paidAmount = this.normalizeAmount(payload.paidAmount);
    const receivedAmount = this.normalizeAmount(payload.receivedAmount);
    this.validateEventAmounts(paidAmount, receivedAmount);

    const event = this.eventsRepository.create({
      id: randomUUID(),
      userId,
      date: eventDate,
      eventName: payload.eventName,
      site: payload.site ?? null,
      memo: payload.memo ?? null,
    });

    const savedEvent = await this.eventsRepository.save(event);
    await this.replaceEventTransactions(userId, savedEvent, person.id, paidAmount, receivedAmount);
    return this.getById(userId, savedEvent.id);
  }

  async update(
    userId: string,
    id: string,
    payload: UpdateEventDto,
  ): Promise<EventDto> {
    const event = await this.eventsRepository.findOne({
      where: { id, userId },
    });

    if (!event) {
      throw new NotFoundException('이벤트를 찾을 수 없습니다.');
    }

    const existingTransactions = await this.transactionsRepository.find({
      where: { userId, eventId: event.id },
      order: { createdAt: 'ASC' },
    });

    if (payload.date !== undefined) {
      const eventDate = new Date(payload.date);
      if (Number.isNaN(eventDate.getTime())) {
        throw new BadRequestException('올바른 날짜 형식이 아닙니다.');
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

    const currentPersonId = existingTransactions[0]?.personId ?? null;
    const nextPersonId = payload.personId ?? payload.person ?? currentPersonId;

    if (!nextPersonId) {
      throw new BadRequestException('인물 ID는 필수입니다.');
    }

    const person = await this.peopleRepository.findOne({
      where: { id: nextPersonId, userId },
    });
    if (!person) {
      throw new BadRequestException('유효하지 않은 인물 ID입니다.');
    }

    const currentPaidAmount = existingTransactions
      .filter((tx) => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const currentReceivedAmount = existingTransactions
      .filter((tx) => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const nextPaidAmount =
      payload.paidAmount !== undefined
        ? this.normalizeAmount(payload.paidAmount)
        : currentPaidAmount;
    const nextReceivedAmount =
      payload.receivedAmount !== undefined
        ? this.normalizeAmount(payload.receivedAmount)
        : currentReceivedAmount;
    this.validateEventAmounts(nextPaidAmount, nextReceivedAmount);

    const savedEvent = await this.eventsRepository.save(event);
    await this.replaceEventTransactions(
      userId,
      savedEvent,
      person.id,
      nextPaidAmount,
      nextReceivedAmount,
    );

    return this.getById(userId, savedEvent.id);
  }

  async remove(userId: string, id: string): Promise<void> {
    const event = await this.eventsRepository.findOne({
      where: { id, userId },
    });

    if (!event) {
      throw new NotFoundException('이벤트를 찾을 수 없습니다.');
    }

    const transactions = await this.transactionsRepository.find({
      where: { userId, eventId: id },
    });
    if (transactions.length > 0) {
      await this.transactionsRepository.remove(transactions);
    }
    await this.eventsRepository.remove(event);
  }

  private normalizeAmount(amount?: number): number {
    if (amount === undefined || amount === null) {
      return 0;
    }
    if (!Number.isFinite(amount) || amount < 0) {
      throw new BadRequestException('금액은 0 이상의 숫자여야 합니다.');
    }
    return amount;
  }

  private validateEventAmounts(paidAmount: number, receivedAmount: number) {
    if (paidAmount > 0 && receivedAmount > 0) {
      throw new BadRequestException(
        '이벤트와 거래내역은 1:1 관계이므로 낸 금액과 받은 금액 중 하나만 0보다 클 수 있습니다.',
      );
    }
  }

  private async replaceEventTransactions(
    userId: string,
    event: EventEntity,
    personId: string,
    paidAmount: number,
    receivedAmount: number,
  ) {
    const existingTransactions = await this.transactionsRepository.find({
      where: { userId, eventId: event.id },
    });

    if (existingTransactions.length > 0) {
      await this.transactionsRepository.remove(existingTransactions);
    }

    const nextTransactions: TransactionEntity[] = [];
    const amount = paidAmount > 0 ? -paidAmount : receivedAmount > 0 ? receivedAmount : 0;

    if (amount !== 0) {
      nextTransactions.push(
        this.transactionsRepository.create({
          id: randomUUID(),
          userId,
          personId,
          eventId: event.id,
          amount,
          date: event.date,
          memo: null,
        }),
      );
    }

    if (nextTransactions.length > 0) {
      await this.transactionsRepository.save(nextTransactions);
    }
  }

  private async buildEventResponses(userId: string, events: EventEntity[]) {
    if (events.length === 0) {
      return [];
    }

    const eventIds = events.map((event) => event.id);
    const transactions = await this.transactionsRepository.find({
      where: { userId, eventId: In(eventIds) },
      order: { createdAt: 'ASC' },
    });
    const personIds = Array.from(new Set(transactions.map((tx) => tx.personId)));
    const people =
      personIds.length > 0
        ? await this.peopleRepository.findBy({ id: In(personIds), userId })
        : [];
    const peopleById = new Map(people.map((person) => [person.id, person]));

    return events.map((event) => {
      const eventTransactions = transactions.filter((tx) => tx.eventId === event.id);
      const person = eventTransactions.length
        ? peopleById.get(eventTransactions[0].personId) ?? null
        : null;

      return {
        id: event.id,
        date: event.date.toISOString().split('T')[0],
        eventName: event.eventName,
        site: event.site ?? null,
        person: person
          ? {
              id: person.id,
              name: person.name,
            }
          : null,
        paidAmount: eventTransactions
          .filter((tx) => tx.amount < 0)
          .reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
        receivedAmount: eventTransactions
          .filter((tx) => tx.amount > 0)
          .reduce((sum, tx) => sum + tx.amount, 0),
        memo: event.memo ?? null,
      };
    });
  }
}
