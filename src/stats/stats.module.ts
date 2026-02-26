import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from '../database/entities';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionEntity])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
