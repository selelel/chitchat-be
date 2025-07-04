import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { AuthService } from '../auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Decoded_JWT } from '../interfaces/jwt_type';

@Injectable()
export class SocketAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx: Socket = context.switchToWs().getClient<Socket>();
    const token = ctx.handshake.headers.authorization.split(' ')[1];
    const [req] = context.getArgs();

    try {
      if (!token || !(await this.authService.validateToken(token))) {
        return false;
      }

      req.decode_token = this.authService.decodeToken(token) as Decoded_JWT;
      req.token = token as string;

      return true;
    } catch (error) {
      return error;
    }
  }
}
