import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
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

@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async testAuth(@GqlCurrentUser() { user }: any) {
    const user_ = await this.userService.findById(user.payload._id);
    console.log(user_);
    return user_;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async changePassword(
    @GqlCurrentUser() user: any,
    @Args('changePassword') { oldPass, newPass }: ChangePasswordInput,
  ) {
    const { _id, provider } = user.user.payload;

    const status = await this.userService.userChangePassword(
      _id,
      oldPass,
      newPass,
      provider,
    );
    return !!status;
  }

  @Query(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async logoutAll(@GqlCurrentUser() { user, token }): Promise<boolean> {
    try {
      await this.authService.removeUserToken(user.payload._id, token, {
        removeAll: true,
      });

      return true;
    } catch (error) {
      return error;
    }
  }

  @Query(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async logout(@GqlCurrentUser() { user, token }): Promise<boolean> {
    const decodedToken = await this.authService.decodeToken(token);
    try {
      if (decodedToken.payload._id === user.payload._id) {
        await this.authService.removeUserToken(
          decodedToken.payload._id,
          token,
          { removeAll: user.payload.provider === 'google' },
        );
        return true;
      }
    } catch (error) {
      return false;
    }
  }

  @Mutation(() => LoginResponse)
  async login(@Args('loginUserInput') loginUserInput: LoginUserInput) {
    const token = await this.authService.login(loginUserInput);
    return token;
  }

  @Mutation(() => User)
  async signin(@Args('signinUserInput') signinUserInput: UserInput) {
    const createdUser = await this.userService.createUser(signinUserInput);
    return createdUser;
  }
}
