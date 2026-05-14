import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { AuthProvider, UserEntity } from '../database/entities';
import { AppleNativeLoginDto } from './dto/login.dto';
import { AppleTokenService } from './services/apple-token.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly appleTokenService: AppleTokenService,
  ) {}

  async oauthLogin(payload: {
    email?: string;
    name?: string;
    profileImage?: string;
    provider: AuthProvider;
    providerSubject?: string;
  }): Promise<{ accessToken: string; refreshToken: string; user: UserEntity }> {
    const { email, name, profileImage, provider, providerSubject } = payload;

    let user: UserEntity | null = null;

    if (providerSubject) {
      user = await this.usersRepository.findOne({
        where: { provider, providerSubject },
      });
    }

    if (!user && email) {
      user = await this.usersRepository.findOne({
        where: { email, provider },
      });
    }

    if (!user && !email) {
      throw new BadRequestException('소셜 로그인 제공자로부터 이메일을 받을 수 없습니다.');
    }

    if (user) {
      if (email) user.email = email;
      if (providerSubject) user.providerSubject = providerSubject;
      user.name = name || user.name;
      if (profileImage) user.profileImage = profileImage;
    } else {
      user = this.usersRepository.create({
        id: randomUUID(),
        email: email!,
        providerSubject,
        name: name || 'User',
        profileImage,
        provider,
      });
    }

    const jwtPayload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(jwtPayload, { expiresIn: '1d' });
    const refreshToken = this.jwtService.sign(jwtPayload, { expiresIn: '30d' });

    user.refreshToken = refreshToken;
    user = await this.usersRepository.save(user);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async appleNativeLogin(payload: AppleNativeLoginDto) {
    const claims = await this.appleTokenService.verifyIdentityToken(payload.identityToken, [
      process.env.APPLE_BUNDLE_ID,
      process.env.APPLE_CLIENT_ID,
    ]);

    return this.oauthLogin({
      email: claims.email,
      name: payload.name || 'Apple User',
      provider: AuthProvider.APPLE,
      providerSubject: claims.sub,
    });
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersRepository.findOne({
        where: { id: payload.sub, refreshToken },
      });

      if (!user) {
        throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
      }

      const jwtPayload = { sub: user.id, email: user.email };
      const newAccessToken = this.jwtService.sign(jwtPayload, { expiresIn: '1d' });
      const newRefreshToken = this.jwtService.sign(jwtPayload, { expiresIn: '30d' });

      user.refreshToken = newRefreshToken;
      await this.usersRepository.save(user);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (e) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }
  }

  async logout(userId: string) {
    await this.usersRepository.update(userId, { refreshToken: null });
    return { success: true };
  }
}
