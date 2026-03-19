import { ApiProperty } from '@nestjs/swagger';

export class YearSummaryDto {
  @ApiProperty({ example: 2026 })
  year: number;

  @ApiProperty({ example: 1200000 })
  totalSent: number;

  @ApiProperty({ example: 350000 })
  totalReceived: number;

  @ApiProperty({ example: 850000 })
  net: number;
}
