import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import type { RequestUser } from '../common/interfaces/request-with-user';
import { StatsService } from './stats.service';

@Controller('stats')
@UseGuards(AuthGuard)
@ApiTags('stats')
@ApiBearerAuth()
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('summary')
  @ApiOperation({ summary: '연간 요약 조회' })
  @ApiQuery({ name: 'year', required: false, example: 2026 })
  @ApiOkResponse({ description: '연간 요약' })
  async getSummary(@CurrentUser() user: RequestUser, @Query('year') year?: string) {
    const parsed = year ? Number(year) : undefined;
    const parsedYear =
      parsed && !Number.isNaN(parsed) ? parsed : new Date().getFullYear();
    return this.statsService.getYearSummary(user.id, parsedYear);
  }
}
