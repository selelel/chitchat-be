import { Controller, Get, HttpException, HttpStatus, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleOAuthGuard } from './guards/google.auth.guard';
import { GoogleCurrentUser } from './decorator/google.current.user';
import { query, Response, Request} from 'express';
import { AxiosResponse } from 'axios';
import { NestAuthGuard } from './guards/nest.auth.guard';
import { NestCurrentUser } from './decorator/nest.current.user';
import { HttpService } from '@nestjs/axios/dist/http.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly httpService: HttpService) {}

  @Get('google/login')
  @UseGuards(GoogleOAuthGuard)
  async login() {
    return 'log_in';
  }

  @Get('google/redirect')
  @UseGuards(GoogleOAuthGuard)
  async redirect(
    @GoogleCurrentUser() { token }: any,
    @Res() res: Response,
    @Query() query: any,
    @Req() req: Request
  ) {
    try {
      if (query.error === 'access_denied') {
        console.warn('OAuth access denied by user.');
        res.redirect('http://localhost:3000/auth/error?message=Unauthorized');
      }

      if (!token) {
        console.warn('Token is missing, possible authorization failure.');
        return res.redirect(301, 'http://localhost:3000/auth/error?message=Unauthorized');
      }

      // Redirect with the token if authorization was successful
      const redirectUrl = `http://localhost:3000/auth/callback?token=${token}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Error during Google OAuth redirect:', error);
      // Redirect to an error page with a 401 status code in case of server error
      res.redirect(301, 'http://localhost:3000/auth/error?message=Unauthorized');
    }
  }

  @Get('google/logout')
  @UseGuards(NestAuthGuard)
  async logout(@NestCurrentUser() { user: { payload: { google_tkn, _id } }, token }: any) {
    const revokeUrl = `https://accounts.google.com/o/oauth2/revoke?token=${google_tkn}`;
    try {
      const response: AxiosResponse = await this.httpService.post(revokeUrl).toPromise();
      await this.authService.removeUserToken(
        _id,
        token,
      );
      return {
        message: 'Successfully logged out from Google',
      };
    } catch (error) {
      console.error('Error revoking Google token:', error);
      throw new HttpException(
        'Failed to log out from Google',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
