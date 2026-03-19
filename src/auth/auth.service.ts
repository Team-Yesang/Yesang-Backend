import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { AuthProvider, UserEntity } from '../database/entities';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async oauthLogin(payload: {
    email: string;
    name: string;
    profileImage?: string;
    provider: AuthProvider;
  }): Promise<{ accessToken: string; refreshToken: string; user: UserEntity }> {
    const { email, name, profileImage, provider } = payload;

    if (!email) {
      throw new BadRequestException('소셜 로그인 제공자로부터 이메일을 받을 수 없습니다.');
    }

    let user = await this.usersRepository.findOne({
      where: { email, provider },
    });

    if (user) {
      user.name = name || user.name;
      if (profileImage) user.profileImage = profileImage;
    } else {
      user = this.usersRepository.create({
        id: randomUUID(),
        email,
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
