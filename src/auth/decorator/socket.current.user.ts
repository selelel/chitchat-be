import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GetCurrentUser } from '../interfaces/jwt_type';

export const SocketCurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const [req] = context.getArgs();
    return {
      decoded_token: req.user,
      token: req.token || req.user.token,
    } as GetCurrentUser;
  },
);
