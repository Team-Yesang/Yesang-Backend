import { Body, Controller, ForbiddenException, Get, Patch } from '@nestjs/common';
import {
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SkipMaintenance } from '../common/decorators/skip-maintenance.decorator';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { MaintenanceService } from './maintenance.service';

@Controller('maintenance')
@ApiTags('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  @SkipMaintenance()
  @ApiOperation({ summary: '서버 점검 상태 조회' })
  @ApiOkResponse({
    schema: {
      example: {
        maintenanceMode: false,
      },
    },
  })
  getStatus() {
    return this.maintenanceService.getStatus();
  }

  @Patch()
  @SkipMaintenance()
  @ApiOperation({ summary: '서버 점검 상태 변경' })
  @ApiBody({ type: UpdateMaintenanceDto })
  @ApiForbiddenResponse({ schema: { example: { message: 'Invalid maintenance password' } } })
  @ApiOkResponse({
    schema: {
      example: {
        maintenanceMode: true,
      },
    },
  })
  updateStatus(@Body() body: UpdateMaintenanceDto) {
    const updated = this.maintenanceService.setStatus(
      body.maintenanceMode,
      body.password,
    );

    if (!updated) {
      throw new ForbiddenException('Invalid maintenance password');
    }

    return this.maintenanceService.getStatus();
  }
}
