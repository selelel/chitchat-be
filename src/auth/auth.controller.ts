import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleOAuthGuard } from './guards/google.auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google/login')
  @UseGuards(GoogleOAuthGuard)
  async login() {
    return 'log_in';
  }

  @Get('google/signin')
  @UseGuards(GoogleOAuthGuard)
  async signin() {
    return 'signIn';
  }

  @Get('google/redirect')
  @UseGuards(GoogleOAuthGuard)
  async redirect() {
    return {msg: 'ok'};
  }
}
