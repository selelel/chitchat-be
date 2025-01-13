import { Injectable } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from '../auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Decoded_JWT } from '../interfaces/jwt_type';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly authService: AuthService) {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    const token = req.headers.authorization?.split(' ')[1];

    console.log(req.headers)
    try {
      if (!token || !(await this.authService.validateToken(token))) {
        return false;
      }

      req.decode_token = this.authService.decodeToken(token) as Decoded_JWT;
      req.token = token as string;

      return true;
    } catch (error) {
      throw error;
    }
  }
}
