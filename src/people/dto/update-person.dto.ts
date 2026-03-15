import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePersonDto {
  @ApiPropertyOptional({ example: '김민수' })
  name?: string;

  @ApiPropertyOptional({ example: '친척' })
  relationship?: string;

  @ApiPropertyOptional({ example: '가족' })
  tag?: string;

  @ApiPropertyOptional({ example: '사촌동생' })
  memo?: string;
}
