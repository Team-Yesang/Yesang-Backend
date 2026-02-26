import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { RequestWithUser } from '../interfaces/request-with-user';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const userId = request.header('x-user-id');

    if (!userId) {
      throw new UnauthorizedException('Missing x-user-id header');
    }

    request.user = { id: userId };
    return true;
  }
}
