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
