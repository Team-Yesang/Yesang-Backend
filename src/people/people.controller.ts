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
import type { CreatePersonDto } from './dto/create-person.dto';
import type { UpdatePersonDto } from './dto/update-person.dto';
import { PeopleService } from './people.service';

@Controller('people')
@UseGuards(AuthGuard)
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get()
  async list(@CurrentUser() user: RequestUser) {
    return this.peopleService.list(user.id);
  }

  @Get('recent')
  async listRecent(@CurrentUser() user: RequestUser, @Query('limit') limit?: string) {
    const parsedLimit = limit ? Number(limit) : undefined;
    const safeLimit = parsedLimit && !Number.isNaN(parsedLimit) ? parsedLimit : undefined;
    return this.peopleService.listRecent(user.id, safeLimit);
  }

  @Get(':id')
  async getById(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.peopleService.getById(user.id, id);
  }

  @Post()
  async create(@CurrentUser() user: RequestUser, @Body() body: CreatePersonDto) {
    return this.peopleService.create(user.id, body);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: UpdatePersonDto,
  ) {
    return this.peopleService.update(user.id, id, body);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    await this.peopleService.remove(user.id, id);
    return { deleted: true };
  }
}
