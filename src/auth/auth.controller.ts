import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginRequestDto, LoginResponseDto } from './dto/login.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login/:provider')
  @ApiOperation({ summary: 'Social login' })
  @ApiParam({
    name: 'provider',
    required: true,
    example: 'google',
    description: 'google | kakao | apple',
  })
  @ApiBody({ type: LoginRequestDto })
  @ApiOkResponse({ type: LoginResponseDto })
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
