import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { TransactionEntity } from '../database/entities';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionsRepository: Repository<TransactionEntity>,
  ) {}

  async getYearSummary(userId: string, year: number) {
    const start = new Date(year, 0, 1, 0, 0, 0, 0);
    const end = new Date(year, 11, 31, 23, 59, 59, 999);
    const transactions = await this.transactionsRepository.find({
      where: { userId, date: Between(start, end) },
    });

    const totalSent = transactions
      .filter((tx) => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);
    const totalReceived = transactions
      .filter((tx) => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    const net = totalSent - totalReceived;

    return {
      year,
      totalSent,
      totalReceived,
      net,
      count: transactions.length,
    };
  }
}
