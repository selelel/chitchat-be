import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GetCurrentUser as TypeGetCurrentUser } from '../interfaces/jwt_type';

export const GqlCurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): TypeGetCurrentUser => {
    const ctx = GqlExecutionContext.create(context);
    return {
      decoded_token: ctx.getContext().req.decode_token,
      token: ctx.getContext().req.token,
    } as TypeGetCurrentUser;
  },
);
