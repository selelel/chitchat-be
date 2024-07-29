import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { sign, verify, decode } from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { LoginResponse } from './dto/login.response';
import { LoginUserInput } from './input/login.input';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import {
  ForbiddenError,
  UnauthorizedError,
} from 'src/utils/error/graphql.error';
import { User } from 'src/user/entities/user.entity';
import { JWT } from 'src/utils/constant/constant';
import { UserProfile } from './dto/google_payload.dto';
import { decodeJwt } from 'src/utils/helpers/jwt_helper' 
import { AccessTokenGeneration } from './interfaces/accesstoken.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private usersService: UserService,
  ) {}

  async createAccessToken( payload : AccessTokenGeneration ): Promise<string> {
    const { _id } = payload 
    const accesstoken = sign(payload, JWT.JWT_SECRET_KEY, {
      expiresIn: JWT.JWT_EXPIRE_IN,
    });
    await this.updateUserToken(_id, accesstoken);
    return accesstoken;
  }

  async validateGoogleLogInUser(details: UserProfile): Promise<User> {
      const user = await this.usersService.findEmail(details.email)
      if(!user){
        return await this.usersService.createGoggleAccountUser(details)
      }
      return user
  }
  // Random question
  // What if the user decided to change his authentication with just jwt or vice versa, jwt to google?

  async validateToken(validate_token: string): Promise<boolean> {
    const {
      payload: { _id, provider},
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
      console.log(decodeJwt(token));
    } catch (error) {
      console.error('Token verification failed:', error);
      return null; // Return null if verification fails
    }
  }

  async login(loginUserInput: LoginUserInput, provider: "jwt" | "google" = "jwt"): Promise<LoginResponse> {
    try {
      const { email, password } = loginUserInput;
      const user = await this.usersService.findEmail(email);

      if (!(await bcrypt.compare(password, user.password)) || !user) {
        throw new UnauthorizedError("Error upon user login");
      }

      const accesstoken = await this.createAccessToken({_id: user._id, provider});
      return { accesstoken, user };
    } catch (error) {
      throw error;
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

  async findUserById(_id:string){
    const user = await this.userModel.findById(_id)
    if(!user) throw new UnauthorizedError("User was not found.")
    return user
  }
}
