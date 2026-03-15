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
