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

  @ApiProperty({ example: true, description: '온보딩 화면 표시 필요 여부' })
  needsOnboarding: boolean;
}

export class DeleteMyAccountResponseDto {
  @ApiProperty({ example: true })
  deleted: boolean;

  @ApiProperty({ example: true })
  tokensInvalidated: boolean;

  @ApiProperty({ example: 3, description: '삭제된 사람 기록 수' })
  deletedPeopleCount: number;

  @ApiProperty({ example: 5, description: '삭제된 이벤트 기록 수' })
  deletedEventsCount: number;

  @ApiProperty({ example: 12, description: '삭제된 거래 기록 수' })
  deletedTransactionsCount: number;
}
