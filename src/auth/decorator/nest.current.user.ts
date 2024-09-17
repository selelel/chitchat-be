import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GetCurrentUser } from '../interfaces/jwt_type';

export const NestCurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const [req] = context.getArgs();

    return {
      decoded_token: req.decode_token,
      token: req.token,
    } as GetCurrentUser;
  },
);
