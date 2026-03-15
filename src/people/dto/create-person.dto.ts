import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePersonDto {
  @ApiProperty({ example: '김민수' })
  name: string;

  @ApiPropertyOptional({ example: '직장' })
  tag?: string;
}

export class PersonDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: '김민수' })
  name: string;

  @ApiPropertyOptional({ example: '직장', nullable: true })
  tag: string | null;
}
