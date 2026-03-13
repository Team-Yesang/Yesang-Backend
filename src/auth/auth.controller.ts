import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { KakaoAuthGuard } from './guards/kakao-auth.guard';
import { AppleAuthGuard } from './guards/apple-auth.guard';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: '구글 로그인 시작' })
  async googleLogin() {}

  @ApiExcludeEndpoint()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleLoginCallback(@Req() req: any, @Res() res: any) {
    const { accessToken } = await this.authService.oauthLogin(req.user);
    const redirectUrl = process.env.FRONTEND_URL || 'yesang://login';
    return this.sendAppRedirect(res, redirectUrl, accessToken);
  }

  @Get('kakao')
  @UseGuards(KakaoAuthGuard)
  @ApiOperation({ summary: '카카오 로그인 시작' })
  async kakaoLogin() {}

  @ApiExcludeEndpoint()
  @Get('kakao/callback')
  @UseGuards(KakaoAuthGuard)
  async kakaoLoginCallback(@Req() req: any, @Res() res: any) {
    const { accessToken } = await this.authService.oauthLogin(req.user);
    const redirectUrl = process.env.FRONTEND_URL || 'yesang://login';
    return this.sendAppRedirect(res, redirectUrl, accessToken);
  }

  @Get('apple')
  @UseGuards(AppleAuthGuard)
  @ApiOperation({ summary: '애플 로그인 시작' })
  async appleLogin() {}

  @ApiExcludeEndpoint()
  @Get('apple/callback')
  @UseGuards(AppleAuthGuard)
  async appleLoginCallback(@Req() req: any, @Res() res: any) {
    const { accessToken } = await this.authService.oauthLogin(req.user);
    const redirectUrl = process.env.FRONTEND_URL || 'yesang://login';
    return this.sendAppRedirect(res, redirectUrl, accessToken);
  }

  private sendAppRedirect(res: Response, url: string, token: string) {
    const finalUrl = `${url}?accessToken=${token}`;
    
    res.setHeader('Content-Type', 'text/html');
    return res.send(`
      <html>
        <body>
          <script>
            window.location.href = "${finalUrl}";
            setTimeout(function() {
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `);
  }
}
