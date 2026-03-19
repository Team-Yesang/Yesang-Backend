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
import { CreateEventDto, EventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';

@Controller('events')
@UseGuards(AuthGuard)
@ApiTags('events')
@ApiBearerAuth()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: '월별 이벤트 목록 조회' })
  @ApiQuery({ name: 'year', required: false, example: 2026 })
  @ApiQuery({ name: 'month', required: false, example: 2 })
  @ApiOkResponse({ type: [EventDto] })
  async listByMonth(
    @CurrentUser() user: RequestUser,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    const parsedYear = year ? Number(year) : undefined;
    const parsedMonth = month ? Number(month) : undefined;
    const safeYear = parsedYear && !Number.isNaN(parsedYear) ? parsedYear : undefined;
    const safeMonth = parsedMonth && !Number.isNaN(parsedMonth) ? parsedMonth : undefined;
    return this.eventsService.listByMonth(user.id, safeYear, safeMonth);
  }

  @Get('upcoming')
  @ApiOperation({ summary: '다가오는 이벤트 목록 조회' })
  @ApiOkResponse({ type: [EventDto] })
  async listUpcoming(@CurrentUser() user: RequestUser) {
    return this.eventsService.listUpcoming(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '이벤트 단건 조회' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: EventDto })
  async getById(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.eventsService.getById(user.id, id);
  }

  @Post()
  @ApiOperation({ summary: '이벤트 생성' })
  @ApiBody({ type: CreateEventDto })
  @ApiCreatedResponse({ type: EventDto })
  async create(@CurrentUser() user: RequestUser, @Body() body: CreateEventDto) {
    return this.eventsService.create(user.id, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: '이벤트 수정' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateEventDto })
  @ApiOkResponse({ type: EventDto })
  async update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: UpdateEventDto,
  ) {
    return this.eventsService.update(user.id, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: '이벤트 삭제' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ schema: { example: { deleted: true } } })
  async remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    await this.eventsService.remove(user.id, id);
    return { deleted: true };
  }
}
