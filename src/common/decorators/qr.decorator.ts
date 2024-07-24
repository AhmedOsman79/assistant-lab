import { UseGuards, applyDecorators } from '@nestjs/common';
import { QrGuard } from '../guards';

import { ContextUtils } from './../../utils/contextUtils';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { qrUser } from '@/constants';

export const ValidateQrCode = () => applyDecorators(UseGuards(QrGuard));

export const getQrUserId = createParamDecorator((_, ctx: ExecutionContext) => {
  const request = ContextUtils.getRequest(ctx);

  const user = request[qrUser];
  return user ? user.id : null;
});
