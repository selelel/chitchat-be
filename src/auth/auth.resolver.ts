import { Args, Mutation, Resolver, Query, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UseGuards } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { LoginResponse } from './dto/login.response';
import { GqlAuthGuard } from './guards/gql.auth.guard';
import { LoginUserInput } from './dto/login.input';
import { UserInput } from 'src/user/dto/user.input.dto';
import { User } from 'src/user/entities/user.entity';
import { GqlCurrentUser } from './decorator/gql.current.user';
import { ChangePasswordInput } from './dto/change.password.input';
import { AUTH, HTTP_COOKIE_OPTION } from 'src/utils/constant/constant';
import { RefreshResponse } from './dto/resfresh.response';
import { Decoded_JWT, GetCurrentUser } from './interfaces/jwt_type';
import { GraphQLContext } from './interfaces/context.interface';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { UnauthorizedError } from 'src/utils/error/graphql.error';
import { JsonWebTokenError } from '@nestjs/jwt';

@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private readonly httpService: HttpService,
  ) {}

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async getUserById(@GqlCurrentUser() { decoded_token }: GetCurrentUser) {
    const user_ = await this.userService.findById(decoded_token.payload._id);
    return user_;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async updateUserPassword(
    @GqlCurrentUser() { decoded_token }: GetCurrentUser,
    @Args('passwordInput') { oldPassword, newPassword }: ChangePasswordInput,
  ) {
    const { _id, provider } = decoded_token.payload;
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
  async logoutAllDevices(
    @GqlCurrentUser() { decoded_token }: GetCurrentUser,
    @Context() { res, req }: GraphQLContext,
  ): Promise<boolean> {
    try {
      const refresh_token = req.cookies[AUTH.REFRESH_TOKEN];
      const decoded_rftoken = (await this.authService.decodeToken(
        refresh_token,
      )) as Decoded_JWT;

      if (decoded_rftoken.payload.provider === 'google') {
        const user = await this.authService.findUserById(
          decoded_rftoken.payload._id,
        );
        const revokeUrl = `https://accounts.google.com/o/oauth2/revoke?token=${user.google_accesstoken}`;

        await fetch(revokeUrl, {
          method: 'POST',
        });
      }

      res.cookie(AUTH.REFRESH_TOKEN, '', { ...HTTP_COOKIE_OPTION, maxAge: 0 });

      await this.authService.removeUserToken(
        decoded_token.payload._id,
        refresh_token,
        {
          removeAll: true,
        },
      );

      return true;
    } catch (error) {
      return error;
    }
  }

  @Query(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async logoutDevice(
    @GqlCurrentUser() { decoded_token }: GetCurrentUser,
    @Context() { res, req }: GraphQLContext,
  ): Promise<boolean> {
    try {
      const refresh_token = req.cookies[AUTH.REFRESH_TOKEN];
      const decoded_rftoken = (await this.authService.decodeToken(
        refresh_token,
      )) as Decoded_JWT;

      if (decoded_rftoken.payload.provider === 'google') {
        const user = await this.authService.findUserById(
          decoded_rftoken.payload._id,
        );
        const revokeUrl = `https://accounts.google.com/o/oauth2/revoke?token=${user.google_accesstoken}`;
        await this.httpService.post(revokeUrl).toPromise();
      }

      res.cookie(AUTH.REFRESH_TOKEN, '', { ...HTTP_COOKIE_OPTION, maxAge: 0 });

      await this.authService.removeUserToken(
        decoded_token.payload._id,
        refresh_token,
      );

      return true;
    } catch (error) {
      return error;
    }
  }

  @Mutation(() => LoginResponse)
  async loginUser(
    @Context() { res }: GraphQLContext,
    @Args('userInput') userInput: LoginUserInput,
  ) {
    try {
      const result = await this.authService.login(userInput);
      const refresh_token = await this.authService.createRefreshToken(
        result.user._id,
      );

      res.cookie(AUTH.REFRESH_TOKEN, refresh_token, HTTP_COOKIE_OPTION);

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Query(() => RefreshResponse)
  async refresh(@Context() { res, req }: GraphQLContext) {
    const refresh_token = req.cookies[AUTH.REFRESH_TOKEN];

    if (!refresh_token) {
      throw new Error('Refresh token is missing.');
    }

    const decoded_rftoken = (await this.authService.decodeToken(
      refresh_token,
    )) as Decoded_JWT;
    try {
      const accessToken =
        await this.authService.validateRefreshToken(refresh_token);
      return { accesstoken: accessToken };
    } catch (error) {
      if (
        error instanceof UnauthorizedError ||
        error instanceof JsonWebTokenError
      ) {
        res.cookie(AUTH.REFRESH_TOKEN, '', {
          ...HTTP_COOKIE_OPTION,
          maxAge: 0,
        });
        await this.authService.removeUserToken(
          decoded_rftoken.payload._id,
          refresh_token,
        );
        throw new Error('INVALID_REFRESH_TOKEN');
      }
      throw new Error(error.message || 'Failed to refresh token.');
    }
  }

  @Mutation(() => User)
  async registerUser(@Args('userInput') userInput: UserInput) {
    const createdUser = await this.userService.createUser(userInput);
    return createdUser;
  }

  @Mutation(() => Boolean)
  async checkUserExistsByEmail(@Args('email') email: string) {
    const user = await this.userService.findEmail(email);
    if (!user) return false;

    return true;
  }
}
