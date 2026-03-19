import { ApiProperty } from '@nestjs/swagger';

export class UpdateMaintenanceDto {
  @ApiProperty({ example: true })
  maintenanceMode: boolean;

  @ApiProperty({ example: '5597' })
  password: string;
}
