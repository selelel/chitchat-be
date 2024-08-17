import { Body, Controller, Get, HttpException, HttpStatus, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleOAuthGuard } from './guards/google.auth.guard';
import { GoogleCurrentUser } from './decorator/google.current.user';
import { query, Response, Request} from 'express';
import { AxiosResponse } from 'axios';
import { NestAuthGuard } from './guards/nest.auth.guard';
import { NestCurrentUser } from './decorator/nest.current.user';
import { HttpService } from '@nestjs/axios/dist/http.service';
import { LoginUserInput } from './dto/login.input';
import { AUTH } from 'src/utils/constant/constant';

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
  ) {
    const user = await this.authService.decodeToken(token)
    const redirectUrl = `http://localhost:3000/auth/callback?token=${token}&user_id=${user.payload._id}`
    res.redirect(redirectUrl);
  }

  @Get('google/logout')
  @UseGuards(NestAuthGuard)
  async logout(@NestCurrentUser() { user: { payload: { _id, google_tkn} }, token}: any) {
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

  @Get('refresh-token')
  refreshToken(@Req() request: Request) {
  console.log("GET COOKIE")
  console.log(request.cookies[AUTH.REFRESH_TOKEN]);
}

@Get('/login')
  async loginUser(
    @Body() userInput: LoginUserInput,
    @Res() res: Response
  ) {
    try {
      const result = await this.authService.login(userInput);
      const refresh_token = await this.authService.createRefreshToken(result.user._id);
      
      res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: true,
        maxAge: 30 * 24 * 60 * 60 * 1000 
      });

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Get('set_cookie')
  findAll(@Res({ passthrough: true }) response: Response) {
    response.cookie('wompwomp', 'value', {
        httpOnly: true,
        secure: true,
        maxAge: 30 * 24 * 60 * 60 * 1000 
      })
    response.header('Set-Cookie', `refresh_token=${'wompwomp'}; HttpOnly; Secure; Max-Age=2592000; SameSite=Lax`);
    console.log("SET COOKIE")
    return 'SET COOKIE'
  }
  }
