import { Body, Controller, Delete, Get, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import type { RequestUser } from '../common/interfaces/request-with-user';
import type { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser() user: RequestUser) {
    return this.usersService.getById(user.id);
  }

  @Patch('me')
  async updateMe(@CurrentUser() user: RequestUser, @Body() body: UpdateUserDto) {
    return this.usersService.update(user.id, body);
  }

  @Delete('me')
  async removeMe(@CurrentUser() user: RequestUser) {
    await this.usersService.remove(user.id);
    return { deleted: true };
  }
}
