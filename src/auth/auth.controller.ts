import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleOAuthGuard } from './guards/google.auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google/login')
  @UseGuards(GoogleOAuthGuard)
  async login() {
    return "WOMP_WOMP";
  }


@Get('google/redirect')
@UseGuards(GoogleOAuthGuard)
  async redirect() {
    return "WOMP_WOMP";
  }
}
