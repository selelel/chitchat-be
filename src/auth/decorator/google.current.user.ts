import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { GoogleCurrentUserPayload } from '../interfaces/jwt_type';

export const GoogleCurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const [req] = context.getArgs();

    console.log(req.user)
    
    return {
      user: req.user.user,
      refresh_token: req.user.refresh_token,
      decoded_token: req.user.decoded_token,
      google_openid: req.user.google_accesstoken
    } as GoogleCurrentUserPayload;
  },
);
