import { NotFoundExceptionFilter } from './common/Exceptions/NotFoundException';
import { ResponseInterceptor } from './common/interceptors';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as compression from 'compression';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    abortOnError: false, // Prevent Nest from aborting the application when an error occurs during initialization
  });
  app.useGlobalFilters(new NotFoundExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Logger)));
  app.useLogger(app.get(Logger));
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.use(compression()); // Compress response data
  app.use(
    helmet({
      frameguard: {
        action: 'deny',
      },
    }),
  );

  const port = parseInt(process.env.PORT) || 3000;

  await app.listen(port, '::', () => {
    console.log(`Ready to use at port ${port} 🚀`);
  });
  console.log(`
  _________  ________  ________  ___  ________  ___     
  |\___   ___\\   __  \|\   __  \|\  \|\   __  \|\  \    
  \|___ \  \_\ \  \|\  \ \  \|\ /\ \  \ \  \|\ /\ \  \   
       \ \  \ \ \   __  \ \   __  \ \  \ \   __  \ \  \  
        \ \  \ \ \  \ \  \ \  \|\  \ \  \ \  \|\  \ \  \ 
         \ \__\ \ \__\ \__\ \_______\ \__\ \_______\ \__\
          \|__|  \|__|\|__|\|_______|\|__|\|_______|\|__|
`)
}
bootstrap();
