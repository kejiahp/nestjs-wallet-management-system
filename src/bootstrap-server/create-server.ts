import * as morgan from 'morgan';

import { NestFactory, Reflector } from '@nestjs/core';
import {
  ClassSerializerInterceptor,
  INestApplication,
  VersioningType,
} from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import helmet from 'helmet';

import { urlencoded, json } from 'express';
import { AppModule } from 'src/app.module';

export interface CreateServerOptions {
  port: number;
  production?: boolean;
  whitelistedDomains?: string[];
}

export default async (
  options: CreateServerOptions,
): Promise<INestApplication> => {
  const app = await NestFactory.create(AppModule);
  const whitelist = options.whitelistedDomains ?? [];

  const corsOptions: CorsOptions = {
    origin: async (origin, callback) => {
      if (!origin) return callback(null, true);

      if (whitelist.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      callback(new Error(`Not allowed by CORS - ${origin}`));
    },
    allowedHeaders: ['Authorization', 'X-Requested-With', 'Content-Type'],
    methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  };

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.use(helmet());
  app.enableCors(corsOptions);

  const baseMorganTokenConfig =
  ":date[iso] :method :url :http-version :status (:response-time ms)";

  app.use(morgan(options.production ? baseMorganTokenConfig : 'dev'));
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });

  app.listen(options.port);

  return app;
};
