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
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { PeopleService } from './people.service';

@Controller('people')
@UseGuards(AuthGuard)
@ApiTags('people')
@ApiBearerAuth()
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get()
  @ApiOperation({ summary: 'List people' })
  @ApiOkResponse({ description: 'List people' })
  async list(@CurrentUser() user: RequestUser) {
    return this.peopleService.list(user.id);
  }

  @Get('recent')
  @ApiOperation({ summary: 'List recent people' })
  @ApiQuery({ name: 'limit', required: false, example: 5 })
  @ApiOkResponse({ description: 'List recent people' })
  async listRecent(@CurrentUser() user: RequestUser, @Query('limit') limit?: string) {
    const parsedLimit = limit ? Number(limit) : undefined;
    const safeLimit = parsedLimit && !Number.isNaN(parsedLimit) ? parsedLimit : undefined;
    return this.peopleService.listRecent(user.id, safeLimit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get person by id' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Person detail' })
  async getById(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.peopleService.getById(user.id, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create person' })
  @ApiBody({ type: CreatePersonDto })
  @ApiCreatedResponse({ description: 'Person created' })
  async create(@CurrentUser() user: RequestUser, @Body() body: CreatePersonDto) {
    return this.peopleService.create(user.id, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update person' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdatePersonDto })
  @ApiOkResponse({ description: 'Person updated' })
  async update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: UpdatePersonDto,
  ) {
    return this.peopleService.update(user.id, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete person' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ schema: { example: { deleted: true } } })
  async remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    await this.peopleService.remove(user.id, id);
    return { deleted: true };
  }
}
