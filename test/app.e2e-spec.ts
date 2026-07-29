import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  EventEntity,
  PersonEntity,
  TransactionEntity,
  UserEntity,
} from '../src/database/entities';
import { UsersController } from '../src/users/users.controller';
import { UsersService } from '../src/users/users.service';

type TestUser = {
  id: string;
  email: string;
  providerSubject?: string | null;
  name: string;
  profileImage?: string | null;
  provider: 'APPLE' | 'GOOGLE' | 'KAKAO';
  refreshToken?: string | null;
  onboardingCompletedAt?: Date | null;
};

type TestPerson = {
  id: string;
  userId: string;
  name: string;
};

type TestEvent = {
  id: string;
  userId: string;
  eventName: string;
  date: Date;
};

type TestTransaction = {
  id: string;
  userId: string;
  personId: string;
  eventId?: string | null;
  amount: number;
  date: Date;
};

type TestState = {
  users: TestUser[];
  people: TestPerson[];
  events: TestEvent[];
  transactions: TestTransaction[];
};

const createUsersRepository = (state: TestState) => ({
  findOne: jest.fn(async ({ where }: { where: Partial<TestUser> }) => {
    if (where.id) {
      return state.users.find((user) => user.id === where.id) ?? null;
    }

    if (where.email && where.provider) {
      return (
        state.users.find(
          (user) =>
            user.email === where.email && user.provider === where.provider,
        ) ?? null
      );
    }

    return null;
  }),
  save: jest.fn(async (user: TestUser) => {
    const index = state.users.findIndex(
      (candidate) => candidate.id === user.id,
    );
    if (index >= 0) {
      state.users[index] = { ...state.users[index], ...user };
      return state.users[index];
    }

    state.users.push(user);
    return user;
  }),
});

const createDataSource = (state: TestState) => ({
  transaction: async <T>(callback: (manager: any) => Promise<T>) => {
    const manager = {
      update: async (
        _entity: unknown,
        where: Partial<TestUser>,
        payload: Partial<TestUser>,
      ) => {
        const user = state.users.find((candidate) => candidate.id === where.id);
        if (user) {
          Object.assign(user, payload);
        }
        return { affected: user ? 1 : 0 };
      },
      delete: async (entity: unknown, where: Record<string, string>) => {
        if (entity === TransactionEntity) {
          const before = state.transactions.length;
          state.transactions = state.transactions.filter(
            (transaction) => transaction.userId !== where.userId,
          );
          return { affected: before - state.transactions.length };
        }

        if (entity === EventEntity) {
          const before = state.events.length;
          state.events = state.events.filter(
            (event) => event.userId !== where.userId,
          );
          return { affected: before - state.events.length };
        }

        if (entity === PersonEntity) {
          const before = state.people.length;
          state.people = state.people.filter(
            (person) => person.userId !== where.userId,
          );
          return { affected: before - state.people.length };
        }

        if (entity === UserEntity) {
          const before = state.users.length;
          state.users = state.users.filter((user) => user.id !== where.id);
          return { affected: before - state.users.length };
        }

        return { affected: 0 };
      },
    };

    return callback(manager);
  },
});

describe('UsersController account deletion (e2e)', () => {
  let controller: UsersController;
  let service: UsersService;
  let state: TestState;

  beforeEach(async () => {
    state = {
      users: [
        {
          id: 'user-1',
          email: 'user1@yesang.kr',
          name: '홍길동',
          provider: 'APPLE',
          onboardingCompletedAt: null,
          refreshToken: 'refresh-token-1',
        },
        {
          id: 'user-2',
          email: 'user2@yesang.kr',
          name: '김철수',
          provider: 'KAKAO',
          onboardingCompletedAt: new Date('2026-05-01T00:00:00Z'),
          refreshToken: 'refresh-token-2',
        },
      ],
      people: [
        { id: 'person-1', userId: 'user-1', name: '가나다' },
        { id: 'person-2', userId: 'user-1', name: '라마바' },
        { id: 'person-3', userId: 'user-2', name: '사아자' },
      ],
      events: [
        {
          id: 'event-1',
          userId: 'user-1',
          eventName: '결혼식',
          date: new Date('2026-05-14T12:00:00Z'),
        },
        {
          id: 'event-2',
          userId: 'user-1',
          eventName: '장례식',
          date: new Date('2026-05-15T12:00:00Z'),
        },
        {
          id: 'event-3',
          userId: 'user-2',
          eventName: '돌잔치',
          date: new Date('2026-05-16T12:00:00Z'),
        },
      ],
      transactions: [
        {
          id: 'tx-1',
          userId: 'user-1',
          personId: 'person-1',
          eventId: 'event-1',
          amount: 50000,
          date: new Date('2026-05-14T12:00:00Z'),
        },
        {
          id: 'tx-2',
          userId: 'user-1',
          personId: 'person-2',
          eventId: 'event-2',
          amount: 100000,
          date: new Date('2026-05-15T12:00:00Z'),
        },
        {
          id: 'tx-3',
          userId: 'user-2',
          personId: 'person-3',
          eventId: 'event-3',
          amount: 70000,
          date: new Date('2026-05-16T12:00:00Z'),
        },
      ],
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: createUsersRepository(state),
        },
        { provide: getRepositoryToken(PersonEntity), useValue: {} },
        { provide: getRepositoryToken(EventEntity), useValue: {} },
        { provide: getRepositoryToken(TransactionEntity), useValue: {} },
        { provide: DataSource, useValue: createDataSource(state) },
      ],
    }).compile();
    controller = moduleFixture.get(UsersController);
    service = moduleFixture.get(UsersService);
  });

  it('returns only public profile fields for my account', async () => {
    const response = await controller.getMe({ id: 'user-1' });

    expect(response).toEqual({
      id: 'user-1',
      email: 'user1@yesang.kr',
      name: '홍길동',
      profileImage: null,
      provider: 'APPLE',
      needsOnboarding: true,
    });
    expect((response as Record<string, unknown>).refreshToken).toBeUndefined();
    expect(
      (response as Record<string, unknown>).providerSubject,
    ).toBeUndefined();
    expect((response as Record<string, unknown>).createdAt).toBeUndefined();
    expect((response as Record<string, unknown>).updatedAt).toBeUndefined();
  });

  it('deletes the user account, related records, and invalidates the token', async () => {
    const deleteResponse = await controller.removeMe({ id: 'user-1' });

    expect(deleteResponse).toEqual({
      deleted: true,
      tokensInvalidated: true,
      deletedPeopleCount: 2,
      deletedEventsCount: 2,
      deletedTransactionsCount: 2,
    });

    expect(state.users.map((user) => user.id)).toEqual(['user-2']);
    expect(state.people.map((person) => person.id)).toEqual(['person-3']);
    expect(state.events.map((event) => event.id)).toEqual(['event-3']);
    expect(state.transactions.map((transaction) => transaction.id)).toEqual([
      'tx-3',
    ]);

    await expect(service.getById('user-1')).rejects.toThrow(NotFoundException);
  });

  it('marks onboarding as completed for my account', async () => {
    const response = await controller.completeOnboarding({ id: 'user-1' });

    expect(response.needsOnboarding).toBe(false);
    expect(state.users[0].onboardingCompletedAt).toBeInstanceOf(Date);
  });
});
