import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ format: 'uuid' })
  personId: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  eventId?: string | null;

  @ApiProperty({ example: 50000 })
  amount: number;

  @ApiProperty({ example: '2026-02-26' })
  date: string;

  @ApiPropertyOptional({ example: '축의금' })
  memo?: string;
}

export class TransactionDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  personId: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  eventId: string | null;

  @ApiProperty({ example: 50000 })
  amount: number;

  @ApiProperty({ example: '2026-02-26' })
  date: string;

  @ApiPropertyOptional({ example: '축의금', nullable: true })
  memo: string | null;

  @ApiProperty({ example: '2026-03-13T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-03-13T00:00:00.000Z' })
  updatedAt: Date;
}
