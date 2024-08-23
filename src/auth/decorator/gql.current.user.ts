import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GetCurrentUser } from '../interfaces/jwt_type';

export const GqlCurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return {
      decoded_token: ctx.getContext().req.decode_token,
      token: ctx.getContext().req.token,
    } as GetCurrentUser;
  },
);
