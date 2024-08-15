import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';

export const GoogleCurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const [req] = context.getArgs();
    let temp_token: string;
    let temp_google_tkn: string;
    temp_token = req.user.token;
    temp_google_tkn = req.user.tkn

    console.log(req.user)
    delete req.user.token;
    return {
      user: req.user as User,
      token: temp_token,

    };
  },
);
