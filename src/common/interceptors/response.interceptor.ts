import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, map, Observable, throwError } from 'rxjs';
import {
  DEFAULT_LOCALE,
  INTERNAL_SERVER_ERROR,
  getMessageFromCode,
  prismaErrors,
} from '@/constants';
import { ErrorResponse, SuccessResponse } from '../response';
import { Prisma } from '@prisma/client';
import { Logger } from 'nestjs-pino';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const lang = req?.query?.lang || DEFAULT_LOCALE;

    return next.handle().pipe(
      catchError((err) => {
        // prisma unique error
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
          if (err.code === prismaErrors.INSERT_UNIQUE) {
            throw new ErrorResponse({
              success: false,
              statusCode: 400,
              code: prismaErrors.INSERT_UNIQUE,
              message: getMessageFromCode(
                prismaErrors.INSERT_UNIQUE,
                [err.meta?.target[0]],
                lang,
              ),
            });
          }

          // prisma forigen key error
          if (err.code === prismaErrors.FOREIGN_KEY_CONSTRAINT) {
            const field = err.meta.field_name;
            const fieldNameFormatted =
              typeof field === 'string'
                ? field.split('_')[1].toLowerCase().split('id')[0]
                : '';

            throw new ErrorResponse({
              success: false,
              message: `this ${fieldNameFormatted} not found`,
              statusCode: 404,
              code: prismaErrors.FOREIGN_KEY_CONSTRAINT,
            });
          }

          // prisma no records updated
          if (err.code === prismaErrors.NO_RECORDS_UPDATED) {
            throw new ErrorResponse({
              success: false,
              message: `no records found to update`,
              statusCode: 404,
              code: prismaErrors.NO_RECORDS_UPDATED,
            });
          }

          this.logger.error('unhandled prisma error code ');
          this.logger.debug({ err });
        }
        /// ------------------------ Custom error ---------------------

        // Check if a custom error is provided
        if (err?.response) {
          // if the error is just a message
          // TODO: handle it later .. shouldn't happen anyways because we always use the object ErrorResponse
          if (typeof err.response === 'string') {
            return throwError(
              () =>
                new ErrorResponse({
                  success: false,
                  message: err.response,
                  statusCode: err.status,
                }),
            );
          }
          // Custom error object
          const { message, code, statusCode, formmatingKeywords } =
            err.response;
          return throwError(
            () =>
              new ErrorResponse({
                success: false,
                message:
                  getMessageFromCode(code, formmatingKeywords, lang) || message,
                code,
                statusCode,
              }),
          );
        } else {
          // something went wrong, if sentry is enabled this error will be logged there
          this.logger.error('::: ' + err);
          return throwError(
            () =>
              new ErrorResponse({
                message: getMessageFromCode(
                  INTERNAL_SERVER_ERROR,
                  undefined,
                  lang,
                ),
                statusCode: 500,
              }),
          );
        }
      }),

      map((successResponse) => {
        const isCustomSuccessResponse =
          successResponse instanceof SuccessResponse;
        return {
          success: true,
          data: isCustomSuccessResponse
            ? successResponse.data
            : successResponse,
          message: isCustomSuccessResponse
            ? getMessageFromCode(successResponse.code, undefined, lang)
            : successResponse.message,
        };
      }),
    );
  }
}
