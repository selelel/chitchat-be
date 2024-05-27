import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UseGuards } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities';
import { CurrentUser } from './decorator/auth.current.user';
import { LoginResponse } from './dto/login.response';
import { GqlAuthGuard } from './guards/gql.auth.guard';
import { LoginUserInput } from './input/login.input';
import { UserInput } from 'src/user/dto/user.input.dto';

@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Query(() => [User])
  @UseGuards(GqlAuthGuard)
  async testAuth() {
    return await this.userService.findAll();
  }

  @Query(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async logoutAll(@CurrentUser() { user, token }): Promise<boolean> {
    const decodedToken = await this.authService.decodeToken(token);
    if (decodedToken.payload._id === user.payload._id) {
      await this.authService.removeUserToken(decodedToken.payload._id, token, {
        removeAll: true,
      });
      return true;
    } else {
      return false;
    }
  }

  @Query(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async logout(@CurrentUser() { user, token }): Promise<boolean> {
    console.log(user);
    const decodedToken = await this.authService.decodeToken(token);
    if (decodedToken.payload._id === user.payload._id) {
      await this.authService.removeUserToken(decodedToken.payload._id, token);
      return true;
    } else {
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
