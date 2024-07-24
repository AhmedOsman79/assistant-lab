import { ConfigModule } from '@nestjs/config';
import { SentryService } from './sentry.service';
import { Module } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SentryInterceptor } from './sentry.interceptor';

export const SENTRY_OPTIONS = 'SENTRY_OPTIONS';

@Module({
  imports: [ConfigModule],
  providers: [SentryService],
  exports: [SentryService],
})
export class SentryModule {
  static forRoot(options: Sentry.NodeOptions) {
    Sentry.init(options);

    return {
      module: SentryModule,
      providers: [
        {
          provide: SENTRY_OPTIONS,
          useValue: options,
        },
        {
          provide: APP_INTERCEPTOR,
          useClass: SentryInterceptor,
        },
        SentryService,
      ],
      exports: [SentryService],
    };
  }
}
