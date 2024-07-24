import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './database/prisma.module';
import { AtGuard } from './common/guards';
import { ConfigModule } from '@nestjs/config';
import { MailingModule } from './mailing/mailing.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ContactsModule } from './contacts/contacts.module';
import { DiseaseModule } from './disease/disease.module';
import { CloudinaryProvider } from './cloudinary/cloudinary.provider';
import { ArticlesModule } from './articles/articles.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LangMiddleware } from './common/middlewares/lang.middleware';
import { MedicinesModule } from './medicines/medicines.module';
import { SentryModule } from './sentry/sentry.module';
import { LoggerModule } from 'nestjs-pino';

const imports = [
  // 20 requests per 1 minute for each ip address to protect the server from brute-force attacks
  ThrottlerModule.forRoot({
    ttl: 60,
    limit: 20,
  }),
  LoggerModule.forRoot({
    pinoHttp: {
      level: (() => {
        const logLevel = {
          production: 'info',
          development: 'debug',
          test: 'error',
        };

        return logLevel[process.env.NODE_ENV] || 'info';
      })(),
      autoLogging: {
        // ignorePaths: ['/api/health'],
      },
      prettyPrint:
        process.env.NODE_ENV !== 'production'
          ? {
              colorize: true,
              levelFirst: true,
              translateTime: 'UTC:mm/dd/yyyy, h:MM:ss TT Z',
            }
          : false,
      redact: ['req.headers.authorization'],
    },
  }),
  PrismaModule,
  AuthModule,
  UsersModule,
  ConfigModule.forRoot({ isGlobal: true }),
  MailingModule,
  MailerModule.forRoot({
    transport: {
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false,
      },
      secure: false,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    },
    defaults: {
      from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`,
    },
    preview: false,
    template: {
      dir: process.cwd() + '/src/templates',
      adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
      options: {
        strict: true,
      },
    },
  }),
  ContactsModule,
  DiseaseModule,
  ArticlesModule,
  MedicinesModule,
];

if (process.env.SENTRY_DNS && process.env.SENTRY_DNS.length > 0) {
  imports.unshift(
    SentryModule.forRoot({
      dsn: process.env.SENTRY_DNS,
      tracesSampleRate: 1.0,
      debug: !!process.env.SENTRY_DEBUG,
      environment: process.env.NODE_ENV,
    }),
  );
}

@Module({
  imports,
  controllers: [AppController],
  providers: [
    // make sure we load the configurations for Cloudinary before other modules are loaded
    CloudinaryProvider,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule implements NestModule {
  constructor() {
    //
  }
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LangMiddleware).forRoutes('*');
  }
}
