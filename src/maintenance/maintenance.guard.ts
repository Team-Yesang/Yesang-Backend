import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SKIP_MAINTENANCE_KEY } from '../common/decorators/skip-maintenance.decorator';
import { MaintenanceService } from './maintenance.service';

@Injectable()
export class MaintenanceGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly maintenanceService: MaintenanceService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const skipMaintenance = this.reflector.getAllAndOverride<boolean>(
      SKIP_MAINTENANCE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipMaintenance) {
      return true;
    }

    if (this.maintenanceService.isEnabled()) {
      throw new ServiceUnavailableException('서버 점검 중입니다.');
    }

    return true;
  }
}
