import { BadRequestException, Injectable } from '@nestjs/common';
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
      throw new BadRequestException('Email is required from OAuth provider');
    }

    let user = await this.usersRepository.findOne({
      where: { email, provider },
    });

    if (user) {
      user.name = name || user.name;
      if (profileImage) user.profileImage = profileImage;
      user = await this.usersRepository.save(user);
    } else {
      user = this.usersRepository.create({
        id: randomUUID(),
        email,
        name: name || 'User',
        profileImage,
        provider,
      });
      user = await this.usersRepository.save(user);
    }

    const jwtPayload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(jwtPayload, { expiresIn: '1d' });
    const refreshToken = this.jwtService.sign(jwtPayload, { expiresIn: '30d' });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }
}
