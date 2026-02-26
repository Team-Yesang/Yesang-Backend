import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePersonDto {
  @ApiPropertyOptional({ example: '김민수' })
  name?: string;

  @ApiPropertyOptional({ example: '학교' })
  tag?: string;
}
