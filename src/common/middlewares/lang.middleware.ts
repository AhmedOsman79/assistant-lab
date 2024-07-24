import { Injectable, NestMiddleware } from '@nestjs/common';
import { Locales } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../response';
import { LOCALE_NOT_SUPPORTED, getMessageFromCode } from '@/constants';

@Injectable()
export class LangMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const lang = req.query.lang;
    if (!lang) return next(); // if there is no local specifed default locale will be used in the response interceptor

    const isLangSupported = Object.values(Locales).find((l) => l == lang);
    if (!isLangSupported)
      return next(
        new ErrorResponse({
          statusCode: 400,
          code: LOCALE_NOT_SUPPORTED,
          message: getMessageFromCode(LOCALE_NOT_SUPPORTED),
        }),
      );

    next();
  }
}
