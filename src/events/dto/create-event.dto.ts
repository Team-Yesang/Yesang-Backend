import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: '2026-02-26' })
  date: string;

  @ApiProperty({ example: '결혼식' })
  eventName: string;

  @ApiPropertyOptional({ example: '서울 호텔' })
  site?: string;

  @ApiPropertyOptional({ example: '친구 결혼식 참석' })
  memo?: string;
}
