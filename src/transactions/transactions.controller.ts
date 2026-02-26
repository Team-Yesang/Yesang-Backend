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
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import type { RequestUser } from '../common/interfaces/request-with-user';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
@UseGuards(AuthGuard)
@ApiTags('transactions')
@ApiBearerAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'List transactions' })
  @ApiQuery({ name: 'personId', required: false, format: 'uuid' })
  @ApiOkResponse({ description: 'List transactions' })
  async list(
    @CurrentUser() user: RequestUser,
    @Query('personId') personId?: string,
  ) {
    return this.transactionsService.list(user.id, personId);
  }

  @Post()
  @ApiOperation({ summary: 'Create transaction' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiCreatedResponse({ description: 'Transaction created' })
  async create(@CurrentUser() user: RequestUser, @Body() body: CreateTransactionDto) {
    return this.transactionsService.create(user.id, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update transaction' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateTransactionDto })
  @ApiOkResponse({ description: 'Transaction updated' })
  async update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(user.id, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete transaction' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ schema: { example: { deleted: true } } })
  async remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    await this.transactionsService.remove(user.id, id);
    return { deleted: true };
  }
}
