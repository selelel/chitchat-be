import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GoogleCurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const [req] = context.getArgs();
    console.log(req);
    return {
      user: req.user,
      token: req.token || req.user.token,
    };
  },
)