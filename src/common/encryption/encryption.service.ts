import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  constructor(private readonly configService: ConfigService) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = Number(this.configService.get('SALTWORKFACTOR'));

    return await bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  hashPaystackWebHookPayload(payload: any, secret: string) {
    return crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
  }
}
