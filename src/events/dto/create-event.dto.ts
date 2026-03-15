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

export class EventDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: '2026-02-26' })
  date: string;

  @ApiProperty({ example: '결혼식' })
  eventName: string;

  @ApiPropertyOptional({ example: '서울 호텔', nullable: true })
  site: string | null;

  @ApiPropertyOptional({ example: '친구 결혼식 참석', nullable: true })
  memo: string | null;

  @ApiProperty({ example: '2026-03-13T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-03-13T00:00:00.000Z' })
  updatedAt: Date;
}
