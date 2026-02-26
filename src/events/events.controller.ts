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
import type { CreateEventDto } from './dto/create-event.dto';
import type { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';

@Controller('events')
@UseGuards(AuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
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
  async getById(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.eventsService.getById(user.id, id);
  }

  @Post()
  async create(@CurrentUser() user: RequestUser, @Body() body: CreateEventDto) {
    return this.eventsService.create(user.id, body);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: UpdateEventDto,
  ) {
    return this.eventsService.update(user.id, id, body);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    await this.eventsService.remove(user.id, id);
    return { deleted: true };
  }
}
