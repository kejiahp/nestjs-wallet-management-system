import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { AuthUserType } from 'src/apps/auth/types';

export const extractUser = (request): AuthUserType => request['user'];

export const CurrentUser = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? extractUser(request)[data] : extractUser(request);
  },
);
