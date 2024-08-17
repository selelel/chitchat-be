import { Args, Mutation, Resolver, Query, Context, GraphQLExecutionContext } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Res, UseGuards } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { LoginResponse } from './dto/login.response';
import { GqlAuthGuard } from './guards/gql.auth.guard';
import { LoginUserInput } from './dto/login.input';
import { UserInput } from 'src/user/dto/user.input.dto';
import { User } from 'src/user/entities/user.entity';
import { GqlCurrentUser } from './decorator/gql.current.user';
import { ChangePasswordInput } from './dto/change.password.input';
import { Response, Request} from 'express'
import { AUTH } from 'src/utils/constant/constant';

@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async getUserById(@GqlCurrentUser() { user }: any) {
    const user_ = await this.userService.findById(user.payload._id);
    return user_;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async updateUserPassword(
    @GqlCurrentUser() user: any,
    @Args('passwordInput') { oldPassword, newPassword }: ChangePasswordInput,
  ) {
    const { _id, provider } = user.user.payload;

    const status = await this.userService.userChangePassword(
      _id,
      oldPassword,
      newPassword,
      provider,
    );
    return !!status;
  }

  @Query(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async logoutAllDevices(@GqlCurrentUser() { user, token }, @Context("res") res: Response): Promise<boolean> {
    try {
      await this.authService.removeUserToken(user.payload._id, token, {
        removeAll: true,
      });

      res.cookie('jwt', '', {
        httpOnly: true,
        secure: true,
        maxAge: 0,
      });

      return true;
    } catch (error) {
      return error;
    }
  }

  @Query(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async logoutDevice(@GqlCurrentUser() { user, token }, @Context("res") res: Response): Promise<boolean> {
    const decodedToken = await this.authService.decodeToken(token);
    try {
      if (decodedToken.payload._id === user.payload._id) {
        await this.authService.removeUserToken(
          decodedToken.payload._id,
          token,
          { removeAll: user.payload.provider === 'google' },
        );

        res.cookie('jwt', '', {
          httpOnly: true,
          secure: true,
          maxAge: 0,
        });

        return true;
      }
    } catch (error) {
      return false;
    }
  }

  @Mutation(() => LoginResponse)
  async loginUser(
    @Context('res') res: Response,
    @Args('userInput') userInput: LoginUserInput,
  ) {
    try {
      const result = await this.authService.login(userInput);
      const refresh_token = await this.authService.createRefreshToken(result.user._id);
      
      res.cookie(AUTH.REFRESH_TOKEN, refresh_token, {
          httpOnly: true,
          secure: true,
          maxAge: 30 * 24 * 60 * 60 * 1000 
      });
      
      return result
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Query(() => String)
  async refresh(@Context("req") req: Request) {
    try {
      const token = req.cookies
      console.log('Cookies:', token);

      // const validate_token = await this.authService.validateRefreshToken(token)
      // console.log(validate_token)
  
      // const refreshToken = token['refresh_token'];
      // console.log('Refresh Token:', refreshToken);
      return 'TEST';
    } catch (error) {
      return error
    }
  }

  @Mutation(() => User)
  async registerUser(@Args('userInput') userInput: UserInput) {
    const createdUser = await this.userService.createUser(userInput);
    return createdUser;
  }
}
