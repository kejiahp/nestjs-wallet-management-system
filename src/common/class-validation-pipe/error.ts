import { HttpException } from '@nestjs/common';

export class ValidationException extends HttpException {
  name = 'ValidationException';
}
