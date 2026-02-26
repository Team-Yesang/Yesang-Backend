import { DataSourceOptions } from 'typeorm';
import {
  EventEntity,
  PersonEntity,
  TransactionEntity,
  UserEntity,
} from './entities';

const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;

export const ormConfig: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number.isNaN(port) ? 3306 : port,
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'yesang',
  entities: [UserEntity, EventEntity, PersonEntity, TransactionEntity],
  migrations: ['dist/database/migrations/*.js'],
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
  charset: 'utf8mb4',
};
