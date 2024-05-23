import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { LoginResponse } from './dto/login-response';
import { LoginUserInput } from './dto/login-response.input';
import { sign, verify, decode } from 'jsonwebtoken';
import { JWT } from 'src/utils/constant';
import { NotFoundError, UnauthorizedError } from 'src/core/graphql.error';
import { ObjectId } from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private usersService: UserService) {}

  // TODO Also create a function that will check if the token is expired or not, then remove the token from the array and create an error

  async createAccessToken(_id: ObjectId, password: string): Promise<string> {
    const user = await this.usersService.findOneById(_id);
    const accesstoken = sign({ _id, password }, JWT.JWT_SUPER_SECRET_KEY, {
      expiresIn: JWT.JWT_EXPIRE_IN,
    });
    console.log(user);
    // TODO pass the token, pls refer to Entity issue
    user.token = [...user.token, accesstoken];
    return accesstoken;
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findEmail(email);
    if (user && user.password === password) {
      return user;
    }
    return new NotFoundError('User');
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      verify(token, process.env.JWT_SUPER_SECRET_KEY);
      return Promise.resolve(true);
    } catch (error) {
      return Promise.resolve(false);
    }
  }

  decodeToken(token: string): any {
    try {
      return decode(token, { complete: true });
    } catch (error) {
      return null;
    }
  }

  // TODO when email is not found make an error for it!
  async login(loginUserInput: LoginUserInput): Promise<LoginResponse> {
    const { email, password } = loginUserInput;
    const user = await this.usersService.findEmail(email);

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedError();
    }

    const accesstoken = await this.createAccessToken(user._id, password);
    return { accesstoken, user };
  }
}
