import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { sign, verify, decode } from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { LoginResponse } from './dto/login.response';
import { LoginUserInput } from './dto/login.input';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import {
  ForbiddenError,
  UnauthorizedError,
} from 'src/utils/error/graphql.error';
import { User } from 'src/user/entities/user.entity';
import { JWT } from 'src/utils/constant/constant';
import { UserProfile } from './dto/google_payload.dto';
import { AccessTokenGeneration } from './interfaces/accesstoken.interface';
import { Decoded_JWT, JWTPayload } from './interfaces/jwt_type';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private usersService: UserService,
  ) {}

  async createAccessToken(payload: AccessTokenGeneration): Promise<string> {
    const accesstoken = sign(payload, JWT.ACCESSTOKEN_SECRET_KEY, {
      expiresIn: JWT.ACCESSTOKEN_EXP,
    });

    return accesstoken;
  }

  async createRefreshToken(
    _id: mongoose.Schema.Types.ObjectId | string | string,
    provider?: JWTPayload['provider'],
  ): Promise<string> {
    const refreshtoken = sign({ _id, provider }, JWT.REFRESHTOKEN_SECRET_KEY, {
      expiresIn: JWT.REFRESHTOKEN_EXP,
    });

    await this.updateUserToken(_id, refreshtoken);
    return refreshtoken;
  }

  async validateRefreshToken(token: string): Promise<string> {
    try {
      const decoded = verify(token, JWT.REFRESHTOKEN_SECRET_KEY) as JWTPayload;

      const user = await this.userModel
        .findOne({ _id: decoded._id, token })
        .exec();

      if (!user) {
        throw new UnauthorizedError('Refresh token was not found.');
      }

      const newAccessToken = await this.createAccessToken({
        _id: decoded._id,
        provider: 'jwt',
      });
      return newAccessToken;
    } catch (error) {
      throw error;
    }
  }

  async validateGoogleLogInUser(
    details: UserProfile,
    google_accesstoken: string,
  ): Promise<User> {
    let user = await this.usersService.findEmail(details.email);

    if (!user) {
      user = await this.usersService.createGoggleAccountUser(details);
    }

    await this.userModel.findByIdAndUpdate(
      user._id,
      { google_accesstoken },
      { new: true },
    );
    return user;
  }

  async validateToken(validate_token: string): Promise<boolean> {
    console.log('validate_token', validate_token);
    try {
      verify(validate_token, JWT.ACCESSTOKEN_SECRET_KEY) as JWTPayload;

      return Promise.resolve(true);
    } catch (error) {
      throw error;
    }
  }

  decodeToken(token: string): any {
    try {
      const decodedToken = decode(token, { complete: true });
      return decodedToken;
    } catch (error) {
      throw error;
    }
  }

  decodeTokenGoogleToken(token: string) {
    try {
      return token;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  async login(
    loginUserInput: LoginUserInput,
    provider: 'jwt' | 'google' = 'jwt',
  ): Promise<LoginResponse> {
    try {
      const { email, password } = loginUserInput;
      const user = await this.usersService.findEmail(email);

      if (!user) {
        throw new Error('Email address does not exist');
      }
      if (!user.password) {
        throw new UnauthorizedError(
          'It looks like you signed up using Google. Please log in using Google to access your account.',
        );
      }

      if (!(await bcrypt.compare(password, user.password)) || !user) {
        throw new UnauthorizedError('The password you entered is incorrect.');
      }

      const payload = {
        _id: user._id,
        provider,
      };
      const accesstoken = await this.createAccessToken(payload);

      return { accesstoken, user };
    } catch (error) {
      throw error;
    }
  }

  async updateUserToken(
    userId: mongoose.Schema.Types.ObjectId | string,
    token: string,
  ): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $push: { token } },
      { new: true },
    );

    return user;
  }

  async removeUserToken(
    userId: mongoose.Schema.Types.ObjectId | string,
    tokenToRemove: string,
    options?: {
      removeAll: boolean;
    },
  ): Promise<void> {
    try {
      if (options.removeAll) {
        await this.userModel.findByIdAndUpdate(
          userId,
          { $set: { token: [] } },
          { new: true },
        );
      } else {
        await this.userModel.findByIdAndUpdate(
          userId,
          { $pull: { token: tokenToRemove } },
          { new: true },
        );
      }
    } catch (error) {
      return error;
    }
  }

  async findUserById(_id: mongoose.Schema.Types.ObjectId | string) {
    const user = await this.userModel.findById(_id);
    if (!user) throw new UnauthorizedError('User was not found.');
    return user;
  }
}
