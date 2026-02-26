import { Injectable } from '@nestjs/common';

export type AuthProvider = 'GOOGLE' | 'KAKAO' | 'APPLE';

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  provider: AuthProvider;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventRecord {
  id: string;
  userId: string;
  date: Date;
  eventName: string;
  site?: string;
  memo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonRecord {
  id: string;
  userId: string;
  name: string;
  tag?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionRecord {
  id: string;
  userId: string;
  personId: string;
  eventId?: string | null;
  amount: number;
  date: Date;
  memo?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class DatabaseService {
  users: UserRecord[] = [];
  events: EventRecord[] = [];
  people: PersonRecord[] = [];
  transactions: TransactionRecord[] = [];
}
