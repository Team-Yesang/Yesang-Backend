import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEventDto {
  @ApiPropertyOptional({ example: '2026-02-27' })
  date?: string;

  @ApiPropertyOptional({ example: '돌잔치' })
  eventName?: string;

  @ApiPropertyOptional({ example: '부산 컨벤션' })
  site?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'personId alias' })
  person?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  personId?: string;

  @ApiPropertyOptional({ example: 70000 })
  paidAmount?: number;

  @ApiPropertyOptional({ example: 10000 })
  receivedAmount?: number;

  @ApiPropertyOptional({ example: '오전 참석' })
  memo?: string;
}
