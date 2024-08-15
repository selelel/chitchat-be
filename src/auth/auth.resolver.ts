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
  async logoutAllDevices(@GqlCurrentUser() { user, token }): Promise<boolean> {
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
  async logoutDevice(@GqlCurrentUser() { user, token }): Promise<boolean> {
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
  async loginUser(@Args('userInput') userInput: LoginUserInput) {

    try {
      const token = await this.authService.login(userInput);
      return token;
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
