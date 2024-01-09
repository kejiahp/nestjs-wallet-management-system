import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from 'src/common/jwt/jwt.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  private getTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return undefined;
    }
    const [tokenType, token] = authHeader.split(' ');

    if (tokenType !== 'Bearer') {
      return undefined;
    }

    return token;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.getTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const decoded = this.jwtService.verifyJwt(token);
      request['user'] = decoded;
    } catch (e) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
