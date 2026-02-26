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
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';

@Controller('events')
@UseGuards(AuthGuard)
@ApiTags('events')
@ApiBearerAuth()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'List events by month' })
  @ApiQuery({ name: 'year', required: false, example: 2026 })
  @ApiQuery({ name: 'month', required: false, example: 2 })
  @ApiOkResponse({ description: 'List events' })
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

  @Get(':id')
  @ApiOperation({ summary: 'Get event by id' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Event detail' })
  async getById(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.eventsService.getById(user.id, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create event' })
  @ApiBody({ type: CreateEventDto })
  @ApiCreatedResponse({ description: 'Event created' })
  async create(@CurrentUser() user: RequestUser, @Body() body: CreateEventDto) {
    return this.eventsService.create(user.id, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update event' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateEventDto })
  @ApiOkResponse({ description: 'Event updated' })
  async update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: UpdateEventDto,
  ) {
    return this.eventsService.update(user.id, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete event' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ schema: { example: { deleted: true } } })
  async remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    await this.eventsService.remove(user.id, id);
    return { deleted: true };
  }
}
