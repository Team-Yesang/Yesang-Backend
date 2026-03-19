import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: '2026-02-26' })
  date: string;

  @ApiProperty({ example: '결혼식' })
  eventName: string;

  @ApiPropertyOptional({ example: '서울 호텔' })
  site?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'personId alias' })
  person?: string;

  @ApiProperty({ format: 'uuid' })
  personId?: string;

  @ApiPropertyOptional({ example: 50000, default: 0 })
  paidAmount?: number;

  @ApiPropertyOptional({ example: 30000, default: 0 })
  receivedAmount?: number;

  @ApiPropertyOptional({ example: '친구 결혼식 참석' })
  memo?: string;
}

export class EventPersonDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: '김민수' })
  name: string;
}

export class EventDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: '2026-02-26' })
  date: string;

  @ApiProperty({ example: '결혼식' })
  eventName: string;

  @ApiPropertyOptional({ example: '서울 호텔', nullable: true })
  site: string | null;

  @ApiPropertyOptional({ type: EventPersonDto, nullable: true })
  person: EventPersonDto | null;

  @ApiProperty({ example: 50000 })
  paidAmount: number;

  @ApiProperty({ example: 30000 })
  receivedAmount: number;

  @ApiPropertyOptional({ example: '친구 결혼식 참석', nullable: true })
  memo: string | null;
}
