import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const GqlCurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    console.log('CurrentUser Invoked');
    const ctx = GqlExecutionContext.create(context);
    return {
      user: ctx.getContext().req.user,
      token: ctx.getContext().req.token,
    };
  },
);
