import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from '../auth.service';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly authService: AuthService) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();

    const token = req.headers.authorization?.split(' ')[1];
    if (!token || !(await this.authService.validateToken(token))) {
      return false;
    }

    req.user = this.authService.decodeToken(token);
    req.token = token;
    return true;
  }
}
