import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import type { RequestUser } from '../common/interfaces/request-with-user';
import type { CreateTransactionDto } from './dto/create-transaction.dto';
import type { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async list(
    @CurrentUser() user: RequestUser,
    @Query('personId') personId?: string,
  ) {
    return this.transactionsService.list(user.id, personId);
  }

  @Post()
  async create(@CurrentUser() user: RequestUser, @Body() body: CreateTransactionDto) {
    return this.transactionsService.create(user.id, body);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(user.id, id, body);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    await this.transactionsService.remove(user.id, id);
    return { deleted: true };
  }
}
