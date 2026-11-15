import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CookUserPayload {
  userId: string;
  email: string;
  role: string;
  username?: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CookUserPayload | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
