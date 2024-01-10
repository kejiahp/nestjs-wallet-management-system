import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

import { PrismaModule } from './apps/prisma/prisma.module';
import { loggerFormat } from './common/utils/winston.logger';
import { SessionModule } from './apps/session/session.module';
import { UserModule } from './apps/user/user.module';
import { AuthModule } from './apps/auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { BullModule } from '@nestjs/bull';
import { WalletModule } from './apps/wallet/wallet.module';

@Module({
  //imports => list of modules, allowing us to access thier classes and dependecies basically all the  providers of a module
  imports: [
    PrismaModule,
    //Configure environment variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    //Winston for logging i also have a none nestjs coupled log in utils
    WinstonModule.forRoot({
      level: 'debug',
      format: loggerFormat,
      transports: [
        process.env.NODE_ENV === 'production'
          ? new winston.transports.File({
              filename: 'log/combine.log',
              level: 'info',
            })
          : new winston.transports.Console(),
      ],
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_CACHE_HOST,
      port: process.env.REDIS_CACHE_PORT,
      ttl: Number(process.env.REDIS_CACHE_TTL),
      auth_pass: process.env.REDIS_PASSWORD,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_CACHE_HOST'),
          port: configService.get('REDIS_CACHE_PORT'),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    SessionModule,
    UserModule,
    AuthModule,
    WalletModule,
  ],
  //list of classes that serve as api endpoints
  controllers: [AppController],
  //providers => list of classes and their dependencies
  providers: [AppService],
  // export => list of classes that can be accessed by other modules
  // exports:[]
})
export class AppModule {}
