import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './dto/user.entity';
import { userInput } from './dto/user.input';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User])
  async testQuery(): Promise<User[]> {
    return await this.userService.findAll();
  }

  @Mutation(() => User)
  async createUser(
    @Args('createUserInput') createUserInput: userInput,
  ): Promise<User> {
    const createdUser = await this.userService.create(createUserInput);
    return createdUser;
  }
}
