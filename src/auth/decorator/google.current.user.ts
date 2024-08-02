import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GoogleCurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const [req] = context.getArgs();
    let temp_token: string;
    temp_token = req.user.token
    delete req.user.token
    return {
      user: req.user,
      token: temp_token,
    };
  },
)