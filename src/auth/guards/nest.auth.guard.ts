import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class NestAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const [, token] = req.headers.authorization.split(' ');

    if (!token || !(await this.authService.validateToken(token))) {
      return false;
    }

    req.user = this.authService.decodeToken(token);
    req.token = token;
    return true;
  }
}
