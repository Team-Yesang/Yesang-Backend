import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTransactionDto {
  @ApiPropertyOptional({ format: 'uuid' })
  personId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  eventId?: string;

  @ApiPropertyOptional({ example: 100000 })
  amount?: number;

  @ApiPropertyOptional({ example: '현금' })
  memo?: string;
}
