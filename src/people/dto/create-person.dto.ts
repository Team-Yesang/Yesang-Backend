import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePersonDto {
  @ApiProperty({ example: '김민수' })
  name: string;

  @ApiPropertyOptional({ example: '친구' })
  relationship?: string;

  @ApiPropertyOptional({ example: '직장' })
  tag?: string;

  @ApiPropertyOptional({ example: '고등학교 동창' })
  memo?: string;
}

export class PersonDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: '김민수' })
  name: string;

  @ApiPropertyOptional({ example: '친구', nullable: true })
  relationship: string | null;

  @ApiPropertyOptional({ example: '직장', nullable: true })
  tag: string | null;

  @ApiPropertyOptional({ example: '고등학교 동창', nullable: true })
  memo: string | null;
}

export class PersonTransactionItemDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: '결혼식' })
  title: string;

  @ApiProperty({ example: '2026-02-26' })
  date: string;

  @ApiProperty({ example: 50000 })
  amount: number;
}

export class PersonDetailDto extends PersonDto {
  @ApiProperty({ example: 100000 })
  totalAmount: number;

  @ApiProperty({ example: 150000 })
  givenAmount: number;

  @ApiProperty({ example: 50000 })
  receivedAmount: number;

  @ApiProperty({ type: [PersonTransactionItemDto] })
  transactions: PersonTransactionItemDto[];
}

export class RecentUpdatedPersonDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: '김민수' })
  name: string;

  @ApiPropertyOptional({ example: '친구', nullable: true })
  relationship: string | null;

  @ApiProperty({ example: 50000 })
  latestAmount: number;

  @ApiProperty({ example: 150000 })
  totalAmount: number;
}
