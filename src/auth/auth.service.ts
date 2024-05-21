import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { LoginResponse } from './dto/login-response';
import { LoginUserInput } from './dto/login-response.input';

@Injectable()
export class AuthService {
  constructor(private usersService: UserService) {}

  async validateUser(loginUserInput: LoginUserInput): Promise<any> {
    const user = await this.usersService.findEmail(loginUserInput.email);
    if (user && user.password === loginUserInput.password) {
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
}
