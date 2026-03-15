import { ApiProperty } from '@nestjs/swagger';

export class MonthlyStatDto {
  @ApiProperty({ example: 1 })
  month: number;

  @ApiProperty({ example: 150000 })
  totalAmount: number;

  @ApiProperty({ example: 3 })
  count: number;
}

export class YearSummaryDto {
  @ApiProperty({ example: 2026 })
  year: number;

  @ApiProperty({ example: 1200000 })
  totalAmount: number;

  @ApiProperty({ example: 24 })
  totalCount: number;

  @ApiProperty({ type: [MonthlyStatDto] })
  monthlyStats: MonthlyStatDto[];
}
