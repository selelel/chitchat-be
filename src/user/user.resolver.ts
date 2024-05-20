import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { userInput } from './dto/user.input';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => String)
  async hiMom() {
    await this.userService.findOne({ _id: '664b1cc43e2924c436da64b2' });
    return 'hio!';
  }

  @Mutation(() => String, { nullable: true })
  async createUser(@Args('input') input: userInput) {
    console.log(input);
    return 'User created successfully!';
  }
}
