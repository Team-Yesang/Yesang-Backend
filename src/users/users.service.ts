import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  EventEntity,
  PersonEntity,
  TransactionEntity,
  UserEntity,
} from '../database/entities';
import { UpdateUserDto, UserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async getById(userId: string): Promise<UserDto> {
    const user = await this.findEntityById(userId);
    return this.toUserDto(user);
  }

  async update(userId: string, payload: UpdateUserDto): Promise<UserDto> {
    const user = await this.findEntityById(userId);

    if (payload.name !== undefined) {
      user.name = payload.name;
    }

    if (payload.profileImage !== undefined) {
      user.profileImage = payload.profileImage ?? null;
    }

    const savedUser = await this.usersRepository.save(user);
    return this.toUserDto(savedUser);
  }

  async completeOnboarding(userId: string): Promise<UserDto> {
    const user = await this.findEntityById(userId);
    user.onboardingCompletedAt = new Date();

    const savedUser = await this.usersRepository.save(user);
    return this.toUserDto(savedUser);
  }

  private async findEntityById(userId: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return user;
  }

  private toUserDto(user: UserEntity): UserDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage ?? null,
      provider: user.provider,
      needsOnboarding: !user.onboardingCompletedAt,
    };
  }

  async remove(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return this.dataSource.transaction(async (manager) => {
      await manager.update(UserEntity, { id: userId }, { refreshToken: null });

      const deletedTransactions = await manager.delete(TransactionEntity, {
        userId,
      });
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
