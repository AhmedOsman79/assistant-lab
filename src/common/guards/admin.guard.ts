import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AdminGuard extends AuthGuard('admin-jwt') {
  constructor(private reflector: Reflector) {
    super({
      property: 'admin',
    });
  }

  canActivate(context: ExecutionContext) {
    const isAdmin = this.reflector.getAllAndOverride<boolean>('isAdmin', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!isAdmin) {
      return true;
    }

    return super.canActivate(context);
  }
}
