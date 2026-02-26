import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuthProvider } from '../../database/entities';

export class LoginRequestDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: '홍길동' })
  name: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
  profileImage?: string;
}

export class LoginUserDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: '홍길동' })
  name: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
  profileImage?: string | null;

  @ApiProperty({ enum: AuthProvider })
  provider: AuthProvider;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'dev-token-uuid' })
  accessToken: string;

  @ApiProperty({ type: LoginUserDto })
  user: LoginUserDto;
}
