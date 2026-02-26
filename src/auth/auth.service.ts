import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthProvider, UserEntity } from '../database/entities';
import { LoginRequestDto } from './dto/login.dto';

const PROVIDER_MAP: Record<string, AuthProvider> = {
  google: AuthProvider.GOOGLE,
  kakao: AuthProvider.KAKAO,
  apple: AuthProvider.APPLE,
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async oauthLogin(payload: {
    email: string;
    name: string;
    profileImage?: string;
    provider: AuthProvider;
  }): Promise<{ accessToken: string; user: UserEntity }> {
    const { email, name, profileImage, provider } = payload;

    if (!email) {
      throw new BadRequestException('Email is required from OAuth provider');
    }

    let user = await this.usersRepository.findOne({
      where: { email, provider },
    });

    if (user) {
      // 정보 업데이트
      user.name = name || user.name;
      if (profileImage) user.profileImage = profileImage;
      user = await this.usersRepository.save(user);
    } else {
      // 신규 가입
      user = this.usersRepository.create({
        id: randomUUID(),
        email,
        name: name || 'User',
        profileImage,
        provider,
      });
      user = await this.usersRepository.save(user);
    }

    return {
      accessToken: `dev-token-${user.id}`, // TODO: 실제 JWT 발급 로직으로 교체 필요
      user,
    };
  }

  // 기존 login 메서드는 하위 호환성을 위해 유지하거나 제거할 수 있습니다.
  async login(providerParam: string, payload: LoginRequestDto): Promise<UserEntity> {
    const providerKey = providerParam?.toLowerCase?.() ?? '';
    const provider = PROVIDER_MAP[providerKey];

    if (!provider) {
      throw new BadRequestException('Unsupported provider');
    }

    if (!payload?.email || !payload?.name) {
      throw new BadRequestException('email and name are required');
    }

    const existing = await this.usersRepository.findOne({
      where: { email: payload.email, provider },
    });

    if (existing) {
      existing.name = payload.name;
      existing.profileImage = payload.profileImage ?? null;
      return this.usersRepository.save(existing);
    }

    const user = this.usersRepository.create({
      id: randomUUID(),
      email: payload.email,
      name: payload.name,
      profileImage: payload.profileImage ?? null,
      provider,
    });

    return this.usersRepository.save(user);
  }
}
