import { Resolver, Query, Mutation } from '@nestjs/graphql';
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
  async createUser(createUserInput: userInput): Promise<User> {
    return await this.userService.create(createUserInput);
  }
}
