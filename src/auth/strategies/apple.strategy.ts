import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-apple';
import { AuthProvider } from '../../database/entities/user.entity';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor() {
    super({
      clientID: process.env.APPLE_CLIENT_ID!,
      teamID: process.env.APPLE_TEAM_ID!,
      keyID: process.env.APPLE_KEY_ID!,
      keyFilePath: process.env.APPLE_PRIVATE_KEY_PATH!, 
      callbackURL: process.env.APPLE_CALLBACK_URL!,
      scope: ['email', 'name'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: any): Promise<any> {
    const user = {
      email: profile.email,
      name: profile.name ? `${profile.name.lastName}${profile.name.firstName}` : 'Apple User',
      provider: AuthProvider.APPLE,
    };
    done(null, user);
  }
}
