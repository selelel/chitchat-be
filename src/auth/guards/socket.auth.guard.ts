import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Socket } from 'socket.io';
import { AuthService } from '../auth.service';

@Injectable()
export class SocketAuthGuard implements CanActivate {
  private logger: Logger = new Logger(SocketAuthGuard.name);
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx: Socket = context.switchToWs().getClient<Socket>();
    const [, token] = ctx.handshake.headers.authorization.split(' ');
    console.log(ctx);
    if (!token || !(await this.authService.validateToken(token))) {
      return false;
    }

    // req.user = this.authService.decodeToken(token);
    // req.token = token;
    return true;
  }
}
