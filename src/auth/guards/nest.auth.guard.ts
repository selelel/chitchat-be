import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { AuthGuard } from '@nestjs/passport';
import { log } from 'console';

@Injectable()
export class NestAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const [, token] = req.headers.authorization.split(' ');

    log(token)
    if (!token || !(await this.authService.validateToken(token))) {
      return false;
    }
    
    req.user = await this.authService.decodeToken(token);
    req.token = token;

    return true;
  }
}
