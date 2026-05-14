import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-apple';
import type { Request } from 'express';
import { AuthProvider } from '../../database/entities/user.entity';
import { AppleTokenService } from '../services/apple-token.service';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor(private readonly appleTokenService: AppleTokenService) {
    super({
      clientID: process.env.APPLE_CLIENT_ID!,
      teamID: process.env.APPLE_TEAM_ID!,
      keyID: process.env.APPLE_KEY_ID!,
      privateKeyLocation: process.env.APPLE_PRIVATE_KEY_PATH!,
      callbackURL: process.env.APPLE_CALLBACK_URL!,
      passReqToCallback: true,
      scope: ['email', 'name'],
    });
  }

  async validate(req: Request, accessToken: string, refreshToken: string, idToken: string): Promise<any> {
    const claims = await this.appleTokenService.verifyIdentityToken(idToken, process.env.APPLE_CLIENT_ID);
    const appleProfile = (req as Request & { appleProfile?: { name?: { firstName?: string; lastName?: string } } })
      .appleProfile;
    const firstName = appleProfile?.name?.firstName;
    const lastName = appleProfile?.name?.lastName;

    return {
      email: claims.email,
      name: firstName || lastName ? `${lastName ?? ''}${firstName ?? ''}` : 'Apple User',
      provider: AuthProvider.APPLE,
      providerSubject: claims.sub,
    };
  }
}
