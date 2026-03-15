import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: '홍길동' })
  name?: string;

  @ApiPropertyOptional({ example: 'https://yesang.kr/avatar.png' })
  profileImage?: string;
}

export class UserDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: '홍길동' })
  name: string;

  @ApiProperty({ example: 'https://yesang.kr/avatar.png', nullable: true })
  profileImage: string | null;

  @ApiProperty({ example: 'KAKAO' })
  provider: string;
}
