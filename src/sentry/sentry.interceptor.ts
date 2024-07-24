import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Scope,
} from '@nestjs/common';
import { catchError, finalize, Observable, throwError } from 'rxjs';
import * as Sentry from '@sentry/node';
import { SentryService } from './sentry.service';
import { ErrorResponse } from '@/common/response';
import { prismaErrors } from '@/constants';
import { Prisma } from '@prisma/client';

/**
 * We must be in Request scope as we inject SentryService
 */
@Injectable({ scope: Scope.REQUEST })
export class SentryInterceptor implements NestInterceptor {
  constructor(private sentryService: SentryService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // start a child span for performance tracing
    const span = this.sentryService.startChild({ op: `route handler` });

    return next.handle().pipe(
      catchError((error) => {
        // capture the error, you can filter out some errors here

        // filter out and handled prisma errors by checking if the error is instance of prisma error
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code in Object.values(prismaErrors))
            return throwError(() => error);
          else {
            // capture the error to sentry
            Sentry.captureException(
              error,
              this.sentryService.span.getTraceContext(),
            );
            return throwError(() => error);
          }
        }

        // make sure it's not a custom error response
        if (error instanceof ErrorResponse && error.getStatus() !== 500)
          return throwError(() => error);

        Sentry.captureException(
          error,
          this.sentryService.span.getTraceContext(),
        );

        // throw again the error
        return throwError(() => error);
      }),
      finalize(() => {
        span.finish();
        this.sentryService.span.finish();
      }),
    );
  }
}
