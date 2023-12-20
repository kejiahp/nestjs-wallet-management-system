import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ValidationException } from '../class-validation-pipe/error';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    switch (true) {
      case exception instanceof ValidationException: {
        const exceptionResponse = exception.getResponse();
        const responseBody = {
          success: false,
          message: 'Failed Validation',
          errors: exceptionResponse,
          stack:
            process.env.NODE_ENV == 'production' ? undefined : exception.stack,
        };
        return httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
      }

      default: {
        const responseBody = {
          success: false,
          message:
            httpStatus == 500 ? 'Something went wrong' : exception.message,
          stack:
            process.env.NODE_ENV == 'production' ? undefined : exception.stack,
        };
        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
      }
    }
  }
}
