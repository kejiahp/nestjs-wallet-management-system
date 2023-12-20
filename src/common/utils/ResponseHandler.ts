import { HttpException, HttpStatus } from '@nestjs/common';

class ResponseHandler {
  public static response(
    statusCode: HttpStatus,
    success: boolean,
    message: string,
    data?: any,
  ) {
    return { statusCode, success, message, data };
  }

  public static error(statusCode: HttpStatus, message: string) {
    throw new HttpException({ statusCode, message }, statusCode);
  }
}

export default ResponseHandler;
