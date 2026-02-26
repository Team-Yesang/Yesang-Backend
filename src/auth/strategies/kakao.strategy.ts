import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { AuthProvider } from '../../database/entities/user.entity';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor() {
    super({
      clientID: process.env.KAKAO_CLIENT_ID!,
      callbackURL: process.env.KAKAO_CALLBACK_URL!,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: any): Promise<any> {
    const { _json } = profile;
    const kakao_account = _json?.kakao_account;
    
    // 이메일이 없을 경우 카카오 고유 ID를 이용해 임시 이메일 생성
    const email = kakao_account?.email || `${profile.id}@kakao.com`;
    const name = kakao_account?.profile?.nickname || profile.displayName || 'Kakao User';
    const profileImage = kakao_account?.profile?.profile_image_url || null;

    const user = {
      email,
      name,
      profileImage,
      provider: AuthProvider.KAKAO,
    };
    done(null, user);
  }
}
