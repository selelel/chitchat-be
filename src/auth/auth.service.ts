import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { LoginResponse } from './dto/login-response';
import { LoginUserInput } from './dto/login-response.input';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private usersService: UserService) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findEmail(email);
    if (user && user.password === password) {
      delete user.password;
      const { ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginUserInput: LoginUserInput): Promise<LoginResponse> {
    const { email, password } = loginUserInput;
    const user = await this.usersService.findEmail(email);
    return { accestoken: password, user };
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      jwt.verify(token, process.env.JWT_SUPER_SECRET_KEY);
      return Promise.resolve(true);
    } catch (error) {
      return Promise.resolve(false);
    }
  }

  decodeToken(token: string): any {
    try {
      const user = this.usersService.findEmail(token);
      return user;
    } catch (error) {
      return null;
    }
  }
}
