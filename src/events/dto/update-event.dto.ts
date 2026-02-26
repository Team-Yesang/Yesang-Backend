import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEventDto {
  @ApiPropertyOptional({ example: '2026-02-27' })
  date?: string;

  @ApiPropertyOptional({ example: '돌잔치' })
  eventName?: string;

  @ApiPropertyOptional({ example: '부산 컨벤션' })
  site?: string;

  @ApiPropertyOptional({ example: '오전 참석' })
  memo?: string;
}
