import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePersonDto {
  @ApiProperty({ example: '김민수' })
  name: string;

  @ApiPropertyOptional({ example: '직장' })
  tag?: string;
}
