import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserInput } from './dto/login-response.input';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(loginUserInput: LoginUserInput): Promise<any> {
    const user = await this.authService.validateUser({
      password: loginUserInput.password,
      email: loginUserInput.email,
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
