import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class KakaoAuthGuard extends AuthGuard('kakao') {
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const redirectUri = request.query.redirect_uri;
    return {
      state: redirectUri ? JSON.stringify({ redirectUri }) : undefined,
    };
  }
}
