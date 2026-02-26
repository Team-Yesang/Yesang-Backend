import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity, PersonEntity, TransactionEntity } from '../database/entities';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity, TransactionEntity, PersonEntity])],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
