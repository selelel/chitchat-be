import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';

export const SocketCurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = context.switchToWs().getClient<Socket>();
    console.log(ctx);
    return {
      user: 'ctx.getContext().req.user',
      token: 'ctx.getContext().req.token',
    };
  },
);
