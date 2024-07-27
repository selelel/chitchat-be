import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
    async canActivate(context: ExecutionContext): Promise<any> {
        const activate = await super.canActivate(context);
        const request = context.switchToHttp().getRequest()
        await super.logIn(request);
        return activate
    }
}