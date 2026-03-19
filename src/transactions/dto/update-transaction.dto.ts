import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTransactionDto {
  @ApiPropertyOptional({ format: 'uuid' })
  personId?: string;

  @ApiPropertyOptional({ example: '결혼식' })
  title?: string;

  @ApiPropertyOptional({ example: 100000 })
  amount?: number;

  @ApiPropertyOptional({ example: '2026-03-01' })
  date?: string;

  @ApiPropertyOptional({ example: '현금' })
  memo?: string;
}
