import { Body, Controller, Delete, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import type { RequestUser } from '../common/interfaces/request-with-user';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard)
@ApiTags('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get my profile' })
  @ApiOkResponse({ description: 'My profile' })
  async getMe(@CurrentUser() user: RequestUser) {
    return this.usersService.getById(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update my profile' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ description: 'Updated profile' })
  async updateMe(@CurrentUser() user: RequestUser, @Body() body: UpdateUserDto) {
    return this.usersService.update(user.id, body);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete my account' })
  @ApiOkResponse({ schema: { example: { deleted: true } } })
  async removeMe(@CurrentUser() user: RequestUser) {
    await this.usersService.remove(user.id);
    return { deleted: true };
  }
}
