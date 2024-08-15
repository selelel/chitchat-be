import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  private readonly clientUri: string;

  constructor(private configService: ConfigService) {
    super();
    this.clientUri = this.configService.get<string>('CLIENT_URI');
  }
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const query = request.query;

    // Redirect user when error occur
    if (query.error) {
      console.warn(`OAuth error occurred: ${query.error}`);
      const host = context.switchToHttp()
      const res = host.getResponse<Response>();

      res.redirect(`${this.clientUri}/auth/login`);
    }
    return (await super.canActivate(context)) as boolean;
  }
}
