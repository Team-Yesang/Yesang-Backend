import { Body, Controller, Param, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { LoginRequestDto, LoginResponseDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login/:provider')
  async login(
    @Param('provider') provider: string,
    @Body() body: LoginRequestDto,
  ): Promise<LoginResponseDto> {
    const user = await this.authService.login(provider, body);

    return {
      accessToken: `dev-token-${user.id}`,
      user,
    };
  }
}
