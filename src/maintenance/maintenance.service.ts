import { Injectable } from '@nestjs/common';

@Injectable()
export class MaintenanceService {
  private readonly password = '5597';
  private enabled = false;

  getStatus() {
    return {
      maintenanceMode: this.enabled,
    };
  }

  setStatus(enabled: boolean, password: string) {
    if (password !== this.password) {
      return false;
    }

    this.enabled = enabled;
    return true;
  }

  isEnabled() {
    return this.enabled;
  }
}
