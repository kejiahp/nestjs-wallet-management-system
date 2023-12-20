import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { loggerFormat } from './common/utils/winston.logger';

@Module({
  //imports => list of modules, allowing us to access thier classes and dependecies basically all the  providers of a module
  imports: [
    PrismaModule,
    //Configure environment variables
    ConfigModule.forRoot(),
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
    PrismaModule,
  ],
  //list of classes that serve as api endpoints
  controllers: [AppController],
  //providers => list of classes and their dependencies
  providers: [AppService, PrismaService],
  // export => list of classes that can be accessed by other modules
  // exports:[]
})
export class AppModule {}
