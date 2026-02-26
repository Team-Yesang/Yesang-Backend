import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { AuthProvider } from '../../database/entities/user.entity';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor() {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET, // 카카오 설정에서 활성화했을 경우 필수
      callbackURL: process.env.KAKAO_CALLBACK_URL,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: any): Promise<any> {
    const { kakao_account } = profile._json;
    const user = {
      email: kakao_account.email,
      name: kakao_account.profile.nickname,
      profileImage: kakao_account.profile.profile_image_url,
      provider: AuthProvider.KAKAO,
    };
    done(null, user);
  }
}
