import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: '홍길동' })
  name?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
  profileImage?: string;
}
