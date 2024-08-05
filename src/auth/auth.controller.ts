import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleOAuthGuard } from './guards/google.auth.guard';
import { GoogleCurrentUser } from './decorator/google.current.user';

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
  async redirect(@GoogleCurrentUser() data: any) {
    return { msg: `user: ${data.user.displayName} is logged in.` };
  }
}
