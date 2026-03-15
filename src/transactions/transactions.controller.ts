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
import { CreateTransactionDto, TransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PersonTransactionResponseDto } from './dto/person-transaction-response.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
@UseGuards(AuthGuard)
@ApiTags('transactions')
@ApiBearerAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: '거래 내역 목록 조회' })
  @ApiQuery({ name: 'personId', required: false, format: 'uuid' })
  @ApiOkResponse({ type: [TransactionDto] })
  async list(
    @CurrentUser() user: RequestUser,
    @Query('personId') personId?: string,
  ) {
    return this.transactionsService.list(user.id, personId);
  }

  @Get('person/:personId')
  @ApiOperation({ summary: '인물별 거래 내역 조회' })
  @ApiParam({ name: 'personId', format: 'uuid' })
  @ApiOkResponse({ type: PersonTransactionResponseDto })
  async listByPerson(
    @CurrentUser() user: RequestUser,
    @Param('personId') personId: string,
  ) {
    return this.transactionsService.listByPerson(user.id, personId);
  }

  @Post()
  @ApiOperation({ summary: '거래 내역 생성' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiCreatedResponse({ type: TransactionDto })
  async create(@CurrentUser() user: RequestUser, @Body() body: CreateTransactionDto) {
    return this.transactionsService.create(user.id, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: '거래 내역 수정' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateTransactionDto })
  @ApiOkResponse({ type: TransactionDto })
  async update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(user.id, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: '거래 내역 삭제' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ schema: { example: { deleted: true } } })
  async remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    await this.transactionsService.remove(user.id, id);
    return { deleted: true };
  }
}
