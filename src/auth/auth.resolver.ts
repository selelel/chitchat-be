import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginResponse } from './dto/login-response';
import { LoginUserInput } from './dto/login-response.input';
// import { GqlAuthGuard } from './gql.auth.guard';
// import { UseGuards } from '@nestjs/common';
import { User } from 'src/user/dto/user.entity';
import { UserInput } from 'src/user/dto/user.input';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  // TODO When user login create the Accestoken push it to its token column array
  @Mutation(() => LoginResponse)
  // @UseGuards(GqlAuthGuard)
  async login(@Args('loginUserInput') loginUserInput: LoginUserInput) {
    const token = await this.authService.login(loginUserInput);
    // Contains User and the token
    return token;
  }

  @Mutation(() => User)
  async signin(@Args('signinUserInput') signinUserInput: UserInput) {
    const createdUser = await this.authService.signin(signinUserInput);
    return createdUser;
  }
}
