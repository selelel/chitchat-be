import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { AuthService } from '../auth.service';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class SocketAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx: Socket = context.switchToWs().getClient<Socket>();
    const token = ctx.handshake.headers.authorization.split(' ')[1];
    const [req] = context.getArgs();
    if (!token || !(await this.authService.validateToken(token))) {
      return false;
    }

    req.user = this.authService.decodeToken(token);
    req.token = token;
    return true;
  }
}
