import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  constructor(private configService: ConfigService) {}

  public signJwt(object: object, options?: jwt.SignOptions) {
    let private_key = this.configService.get<string>('JWT_PRIVATE_KEY');
    private_key = Buffer.from(private_key, 'base64').toString('ascii');

    return jwt.sign(object, private_key, {
      ...(options && options),
      algorithm: 'RS256',
    });
  }

  public verifyJwt(token: string) {
    let public_key = this.configService.get<string>('JWT_PUBLIC_KEY');
    public_key = Buffer.from(public_key, 'base64').toString('ascii');

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

  public signAccessToken(object: { [key: string]: any }) {
    const accessTokenTTL = this.configService.get<string>('ACCESSTOKENTTL');

    return this.signJwt(object, { expiresIn: accessTokenTTL });
  }

  public signRefreshToken(object: { [key: string]: any }) {
    const refreshTokenTTL = this.configService.get<string>('REFRESHTOKENTTL');

    return this.signJwt(object, { expiresIn: refreshTokenTTL });
  }
}
