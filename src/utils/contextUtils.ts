import { ExecutionContext } from '@nestjs/common';

export class ContextUtils {
  static getRequest(ctx: ExecutionContext) {
    return ctx.switchToHttp().getRequest();
  }
}
