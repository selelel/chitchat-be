import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const SocketCurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const [req] = context.getArgs();
    return {
      user: req.user,
      token: req.token,
    };
  },
);
