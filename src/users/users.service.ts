import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { EventEntity, PersonEntity, TransactionEntity, UserEntity } from '../database/entities';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async getById(userId: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return user;
  }

  async update(userId: string, payload: UpdateUserDto): Promise<UserEntity> {
    const user = await this.getById(userId);

    if (payload.name !== undefined) {
      user.name = payload.name;
    }

    if (payload.profileImage !== undefined) {
      user.profileImage = payload.profileImage ?? null;
    }

    return this.usersRepository.save(user);
  }

  async remove(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return this.dataSource.transaction(async (manager) => {
      await manager.update(UserEntity, { id: userId }, { refreshToken: null });

      const deletedTransactions = await manager.delete(TransactionEntity, { userId });
      const deletedEvents = await manager.delete(EventEntity, { userId });
      const deletedPeople = await manager.delete(PersonEntity, { userId });
      await manager.delete(UserEntity, { id: userId });

      return {
        deleted: true,
        tokensInvalidated: true,
        deletedPeopleCount: deletedPeople.affected ?? 0,
        deletedEventsCount: deletedEvents.affected ?? 0,
        deletedTransactionsCount: deletedTransactions.affected ?? 0,
      };
    });
  }
}
