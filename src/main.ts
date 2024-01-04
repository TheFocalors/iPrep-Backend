import { ClassSerializerInterceptor, VersioningType } from '@nestjs/common';
import { Logger as AppLogger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dayjs from 'dayjs';
import advanced from 'dayjs/plugin/advancedFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import helmet from 'helmet';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import path from 'path';
import responseTime from 'response-time';

import { AppModule } from '@/app.module';

import { ConfigName } from './common/constants/config-name.constant';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AppUtils } from './common/helpers/app.utils';
import { setupSwagger } from './common/helpers/swagger.utils';
import RequestValidationPipe from './common/pipes/request-validation.pipe';
import { IAppEnvConfig } from './lib/config/configs/app.config';

async function bootstrap() {
  dayjs.extend(timezone);
  dayjs.extend(utc);
  dayjs.extend(advanced);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true,
    snapshot: true,
  });

  const configService = app.get(ConfigService);
  const appConfig = configService.get<IAppEnvConfig>(ConfigName.APP);

  AppUtils.killApp(app);

  // Configure static assets
  app.useStaticAssets(path.join(__dirname, '..', 'public'), {
    prefix: '/static/',
  });
  app.setBaseViewsDir(path.join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  // use pino logger
  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  // Use custom api error response
  app.useGlobalFilters(new HttpExceptionFilter());

  // Configure ClassSerializerInterceptor
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Configure ValidationPipe
  app.useGlobalPipes(
    new RequestValidationPipe({
      whitelist: true,
      stopAtFirstError: true,
    }),
  );

  app.set('trust proxy', 1);

  // Configure Middlewares
  app.use([helmet(), responseTime(), compression(), cookieParser()]);

  app.enableCors({
    preflightContinue: true,
    credentials: true,
  });

  // Enable api versioning with URI prefix (e.g. /v1/*)
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Configure Swagger and Redocly
  if (appConfig?.swaggerEnabled) {
    await setupSwagger(app, '/docs');
  }

  // Start server
  app.listen(appConfig?.port || 3000).then(() => {
    const port = app.getHttpServer().address().port;

    AppLogger.log(`🚀 Server started on http://localhost:${port}`);
    if (appConfig?.swaggerEnabled) {
      AppLogger.log(`📖 Swagger started on http://localhost:${port}/docs`);
    }
  });
}

bootstrap();
