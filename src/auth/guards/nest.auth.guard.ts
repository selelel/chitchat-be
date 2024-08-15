import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class NestAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const [, token] = req.headers.authorization.split(' ');

    console.log(token)


    if (!token || !(await this.authService.validateToken(token))) {
      return false;
    }

    req.user = this.authService.decodeToken(token);
    req.token = token;
    return true;
  }
}
