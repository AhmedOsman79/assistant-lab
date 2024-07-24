import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { ErrorResponse } from '../response';
import { EXPIRED_TOKEN, INVALID_TOKEN, qrUser } from '@/constants';

export class QrGuard extends AuthGuard('qr-jwt') {
  constructor() {
    super({
      property: qrUser,
    });
  }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(err, user, info: Error) {
    if (info?.name === 'TokenExpiredError') {
      // Handle the expired token error
      throw new ErrorResponse({
        statusCode: 401,
        code: EXPIRED_TOKEN,
      });
    }

    if (info?.name === 'JsonWebTokenError') {
      // Handle the invalid token error
      throw new ErrorResponse({
        code: INVALID_TOKEN,
        statusCode: 401,
      });
    }

    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    return user;
  }
}
