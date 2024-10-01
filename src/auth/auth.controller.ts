import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleOAuthGuard } from './guards/google.auth.guard';
import { GoogleCurrentUser } from './decorator/google.current.user';
import { Response} from 'express';
import { AUTH, HTTP_COOKIE_OPTION } from 'src/utils/constant/constant';
import { GoogleCurrentUserPayload } from './interfaces/jwt_type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google/login')
  @UseGuards(GoogleOAuthGuard)
  async login() {
    return 'log_in';
  }

  @Get('google/redirect')
  @UseGuards(GoogleOAuthGuard)
  async redirect(
    @GoogleCurrentUser() { refresh_token }: GoogleCurrentUserPayload,
    @Res() res: Response,
  ) {
    const redirectUrl = `http://localhost:3000/`;

    res.cookie(AUTH.REFRESH_TOKEN, refresh_token, HTTP_COOKIE_OPTION);
    
    res.redirect(redirectUrl);
  }
}
