import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { sign, verify, decode } from 'jsonwebtoken';
import { JWT } from 'src/utils/constant';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/user/entities';
import { LoginResponse } from './dto/login.response';
import { LoginUserInput } from './input/login.input';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import {
  ForbiddenError,
  UnauthorizedError,
} from 'src/core/error/graphql.error';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private usersService: UserService,
  ) {}

  async createAccessToken(
    _id: mongoose.Schema.Types.ObjectId,
    password: string,
  ): Promise<string> {
    const accesstoken = sign({ _id, password }, JWT.JWT_SUPER_SECRET_KEY, {
      expiresIn: JWT.JWT_EXPIRE_IN,
    });
    await this.updateUserToken(_id, accesstoken);
    return accesstoken;
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findEmail(email);
    if (user && user.password === password) {
      return user;
    }
    return new ForbiddenError();
  }

  async validateToken(validate_token: string): Promise<boolean> {
    const {
      payload: { _id },
    } = this.decodeToken(validate_token);
    const user = await this.usersService.findOneById(_id);
    try {
      if (
        !user.token.includes(validate_token) &&
        !verify(validate_token, process.env.JWT_SUPER_SECRET_KEY)
      ) {
        throw new Error('Authentication Error');
      }
      return Promise.resolve(true);
    } catch (error) {
      this.removeUserToken(_id, validate_token);
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

  async login(loginUserInput: LoginUserInput): Promise<LoginResponse> {
    try {
      const { email, password } = loginUserInput;
      const user = await this.usersService.findEmail(email);

      if (!(await bcrypt.compare(password, user.password)) || !user) {
        throw new UnauthorizedError();
      }

      const accesstoken = await this.createAccessToken(user._id, password);
      return { accesstoken, user };
    } catch (error) {
      return error;
    }
  }

  async updateUserToken(
    userId: mongoose.Schema.Types.ObjectId,
    newToken: string,
  ): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $push: { token: newToken } },
      { new: true },
    );

    return user;
  }

  async removeUserToken(
    userId: mongoose.Schema.Types.ObjectId,
    tokenToRemove: string,
    options?: {
      removeAll: boolean;
    },
  ): Promise<void> {
    if (options?.removeAll) {
      await this.userModel.findByIdAndUpdate(userId, { $set: { token: [] } });
    } else {
      await this.userModel.findByIdAndUpdate(
        userId,
        { $pull: { token: tokenToRemove } },
        { new: true },
      );
    }
  }
}
