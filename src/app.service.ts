import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}
  healthCheck(): string {
    return (
      'Server is running on port: ' + this.configService.get<string>('PORT')
    );
  }
}
