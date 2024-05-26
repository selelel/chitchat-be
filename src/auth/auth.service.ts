import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { sign, verify, decode } from 'jsonwebtoken';
import { JWT } from 'src/utils/constant';
import { NotFoundError, UnauthorizedError } from 'src/core/graphql.error';
import { ObjectId, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities';
import { LoginResponse } from './dto/login.response';
import { LoginUserInput } from './input/login.input';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private usersService: UserService,
  ) {}

  // TODO Also create a function that will check if the token is expired or not, then remove the token from the array and create an error

  async createAccessToken(_id: ObjectId, password: string): Promise<string> {
    const user = await this.usersService.findOneById(_id);
    const accesstoken = sign({ _id, password }, JWT.JWT_SUPER_SECRET_KEY, {
      expiresIn: JWT.JWT_EXPIRE_IN,
    });
    // TODO pass the token, pls refer to Entity issue
    await this.addToken(user._id, accesstoken, user.token);
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
      const {
        payload: { _id },
      } = this.decodeToken(token);
      this.removeToken(_id, token);
      return Promise.resolve(false);
    }
  }

  decodeToken(token: string): any {
    try {
      const decodedToken = decode(token, { complete: true });
      return decodedToken;
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

  async addToken(
    _id: ObjectId,
    token: string,
    currentToken: string[] = [],
  ): Promise<void> {
    const addedToken = currentToken.concat(token);
    this.userRepository.update(_id, { token: addedToken });
  }

  async removeToken(
    _id: ObjectId,
    token_to_remove: string,
    option?: { removeAll?: boolean },
  ): Promise<void> {
    const { token } = await this.usersService.findOneById(_id);
    const filterToken = token.filter((d: string) => d !== token_to_remove);
    this.userRepository.update(_id, {
      token: option?.removeAll ? [] : [...filterToken],
    });
  }
}
