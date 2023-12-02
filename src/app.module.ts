import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from "winston"
import { loggerFormat } from './utils/winston.logger';



@Module({
  imports: [
    //Configure environment variables
    ConfigModule.forRoot(),
    //Winston for logging i also have a none nestjs coupled log in utils
    WinstonModule.forRoot({
      level: "debug",
      format: loggerFormat,
      transports: [
        process.env.NODE_ENV === "production" ? 
        new winston.transports.File({ filename: "log/combine.log", level: "info" })
        :
        new winston.transports.Console(),
      ]
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
