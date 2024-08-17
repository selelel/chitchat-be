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
import { UserProfile } from './dto/google_payload.dto';;
import { AccessTokenGeneration } from './interfaces/accesstoken.interface';
import { error } from 'console';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private usersService: UserService,
  ) {}

  async createAccessToken(payload: AccessTokenGeneration): Promise<string> {
    const accesstoken = sign(payload, JWT.JWT_SECRET_KEY, {
      expiresIn: JWT.ACCESSTOKEN_EXP,
    });

    return accesstoken;
  }

  async createRefreshToken(user_id: mongoose.Schema.Types.ObjectId): Promise<string> {
    const refreshtoken = sign({ user_id }, JWT.JWT_SECRET_KEY, {
      expiresIn: JWT.REFRESHTOKEN_EXP,
    });

    await this.updateUserToken(user_id, refreshtoken);
    return refreshtoken;
  }

  async validateRefreshToken(token:string): Promise<void> {
    let accesstoken : string
    verify(token, process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
          // if(error) throw new UnauthorizedError()
          console.log(err)
          console.log(decoded)
      })
    // await this.updateUserToken(user_id, refreshtoken);
    // return refreshtoken;
  }

  async validateGoogleLogInUser(details: UserProfile): Promise<User> {
    const user = await this.usersService.findEmail(details.email);
    if (!user) {
      return await this.usersService.createGoggleAccountUser(details);
    }
    return user;
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
        throw new UnauthorizedError('It looks like you signed up using Google. Please log in using Google to access your account.');
      }      

      if (!(await bcrypt.compare(password, user.password)) || !user) {
        throw new UnauthorizedError('The password you entered is incorrect.');
      }

      const payload = {
        _id: user._id,
        provider,
      }
      const accesstoken = await this.createAccessToken(payload);

      return { accesstoken, user};
    } catch (error) {
      throw error;
    }
  }

  async updateUserToken(
    userId: mongoose.Schema.Types.ObjectId,
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
    userId: mongoose.Schema.Types.ObjectId,
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

  async findUserById(_id: string) {
    const user = await this.userModel.findById(_id);
    if (!user) throw new UnauthorizedError('User was not found.');
    return user;
  }
}
