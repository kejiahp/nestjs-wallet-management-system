import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  constructor(private configService: ConfigService) {}

  public signJwt(object: object, options?: jwt.SignOptions) {
    const private_key = this.configService.get<string>('JWT_PRIVATE_KEY');
    return jwt.sign(object, private_key, {
      ...(options && options),
      algorithm: 'RS256',
    });
  }

  public verifyJwt(token: string) {
    const public_key = this.configService.get<string>('JWT_PUBLIC_KEY');
    try {
      const decoded = jwt.verify(token, public_key);

      return {
        valid: true,
        expired: false,
        decoded,
      };
    } catch (e: any) {
      return {
        valid: false,
        expired: e.message === 'jwt expired',
        decoded: null,
      };
    }
  }
}
