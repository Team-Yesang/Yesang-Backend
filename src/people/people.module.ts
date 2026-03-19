import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity, PersonEntity, TransactionEntity } from '../database/entities';
import { PeopleController } from './people.controller';
import { PeopleService } from './people.service';

@Module({
  imports: [TypeOrmModule.forFeature([PersonEntity, TransactionEntity, EventEntity])],
  controllers: [PeopleController],
  providers: [PeopleService],
})
export class PeopleModule {}
