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
import {
  CreatePersonDto,
  PersonDetailDto,
  PersonDto,
  RecentUpdatedPersonDto,
} from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { PeopleService } from './people.service';

@Controller('people')
@UseGuards(AuthGuard)
@ApiTags('people')
@ApiBearerAuth()
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get()
  @ApiOperation({ summary: '인물 목록 조회' })
  @ApiOkResponse({ type: [RecentUpdatedPersonDto] })
  async list(@CurrentUser() user: RequestUser) {
    return this.peopleService.list(user.id);
  }

  @Get('recent')
  @ApiOperation({ summary: '최근 인물 목록 조회' })
  @ApiQuery({ name: 'limit', required: false, example: 5 })
  @ApiOkResponse({ type: [PersonDto] })
  async listRecent(@CurrentUser() user: RequestUser, @Query('limit') limit?: string) {
    const parsedLimit = limit ? Number(limit) : undefined;
    const safeLimit = parsedLimit && !Number.isNaN(parsedLimit) ? parsedLimit : undefined;
    return this.peopleService.listRecent(user.id, safeLimit);
  }

  @Get('recently-updated')
  @ApiOperation({ summary: '최근 2주 내 거래가 있는 인물 목록 조회' })
  @ApiOkResponse({ type: [RecentUpdatedPersonDto] })
  async listRecentlyUpdated(@CurrentUser() user: RequestUser) {
    return this.peopleService.listRecentlyUpdated(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '인물 단건 조회' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: PersonDetailDto })
  async getById(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.peopleService.getById(user.id, id);
  }

  @Post()
  @ApiOperation({ summary: '인물 생성' })
  @ApiBody({ type: CreatePersonDto })
  @ApiCreatedResponse({ type: PersonDto })
  async create(@CurrentUser() user: RequestUser, @Body() body: CreatePersonDto) {
    return this.peopleService.create(user.id, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: '인물 수정' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdatePersonDto })
  @ApiOkResponse({ type: PersonDto })
  async update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: UpdatePersonDto,
  ) {
    return this.peopleService.update(user.id, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: '인물 삭제' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ schema: { example: { deleted: true } } })
  async remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    await this.peopleService.remove(user.id, id);
    return { deleted: true };
  }
}
