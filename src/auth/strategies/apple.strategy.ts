import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-apple';
import { AuthProvider } from '../../database/entities/user.entity';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor() {
    super({
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      keyID: process.env.APPLE_KEY_ID,
      keyFilePath: process.env.APPLE_PRIVATE_KEY_PATH, // 파일 경로 또는 keyContent 사용 가능
      callbackURL: process.env.APPLE_CALLBACK_URL,
      scope: ['email', 'name'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: any): Promise<any> {
    // 애플은 첫 로그인 시에만 name 정보를 줍니다.
    // profile.name 정보가 없을 수 있음을 유의해야 합니다.
    const user = {
      email: profile.email,
      name: profile.name ? `${profile.name.lastName}${profile.name.firstName}` : 'Apple User',
      provider: AuthProvider.APPLE,
    };
    done(null, user);
  }
}
