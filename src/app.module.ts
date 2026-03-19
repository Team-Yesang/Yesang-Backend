import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ormConfig } from './database/typeorm.config';
import { EventsModule } from './events/events.module';
import { MaintenanceGuard } from './maintenance/maintenance.guard';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { PeopleModule } from './people/people.module';
import { StatsModule } from './stats/stats.module';
import { TransactionsModule } from './transactions/transactions.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig),
    AuthModule,
    UsersModule,
    EventsModule,
    MaintenanceModule,
    PeopleModule,
    TransactionsModule,
    StatsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: MaintenanceGuard,
    },
  ],
})
export class AppModule {}
