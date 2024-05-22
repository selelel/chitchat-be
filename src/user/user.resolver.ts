import { Resolver, Query } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './dto/user.entity';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User])
  async testQuery(): Promise<User[]> {
    return await this.userService.findAll();
  }
}
