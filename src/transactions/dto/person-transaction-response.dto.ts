import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionDto } from './create-transaction.dto';

export class PersonTransactionResponseDto {
  @ApiProperty({ example: 150000 })
  balance: number;

  @ApiPropertyOptional({ example: 50000, nullable: true })
  latestAmount: number | null;

  @ApiProperty({ type: [TransactionDto] })
  transactions: TransactionDto[];
}
