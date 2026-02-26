import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
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
  async googleLogin() {
    // GoogleAuthGuard가 리다이렉트를 처리합니다.
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: '구글 로그인 콜백' })
  async googleLoginCallback(@Req() req: any, @Res() res: any) {
    const { accessToken } = await this.authService.oauthLogin(req.user);
    const redirectUrl = process.env.FRONTEND_URL || 'yesang://oauth-callback';
    return res.redirect(`${redirectUrl}?token=${accessToken}`);
  }

  @Get('kakao')
  @UseGuards(KakaoAuthGuard)
  @ApiOperation({ summary: '카카오 로그인 시작' })
  async kakaoLogin() {
    // KakaoAuthGuard가 리다이렉트를 처리합니다.
  }

  @Get('kakao/callback')
  @UseGuards(KakaoAuthGuard)
  @ApiOperation({ summary: '카카오 로그인 콜백' })
  async kakaoLoginCallback(@Req() req: any, @Res() res: any) {
    const { accessToken } = await this.authService.oauthLogin(req.user);
    const redirectUrl = process.env.FRONTEND_URL || 'yesang://oauth-callback';
    return res.redirect(`${redirectUrl}?token=${accessToken}`);
  }

  @Get('apple')
  @UseGuards(AppleAuthGuard)
  @ApiOperation({ summary: '애플 로그인 시작' })
  async appleLogin() {
    // AppleAuthGuard가 리다이렉트를 처리합니다.
  }

  @Get('apple/callback')
  @UseGuards(AppleAuthGuard)
  @ApiOperation({ summary: '애플 로그인 콜백' })
  async appleLoginCallback(@Req() req: any, @Res() res: any) {
    const { accessToken } = await this.authService.oauthLogin(req.user);
    const redirectUrl = process.env.FRONTEND_URL || 'yesang://oauth-callback';
    return res.redirect(`${redirectUrl}?token=${accessToken}`);
  }
}
