import { Injectable } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Decoded_JWT } from '../interfaces/jwt_type';

@Injectable()
export class NestAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const [, token] = req.headers.authorization.split(' ');

    try {
      if (!token || !(await this.authService.validateToken(token))) {
        return false;
      }

      req.decode_token = this.authService.decodeToken(token) as Decoded_JWT;
      req.token = token as string;

      return true;
    } catch (error) {
      return error
    }
  }
}
