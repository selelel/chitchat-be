import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserInput } from './dto/user.input.dto';
import { User } from './entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql.auth.guard';
import { GqlCurrentUser } from 'src/auth/decorator/gql.current.user';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User])
  async testQuery(): Promise<User[]> {
    return await this.userService.findAll();
  }

  @Mutation(() => User)
  async createUser(
    @Args('createUserInput') createUserInput: UserInput,
  ): Promise<User> {
    const createdUser = await this.userService.createUser(createUserInput);
    return createdUser;
  }

  // TODO Create Mutatations
  // TODO if both user and targetUser was both found each request, add friend them already
  // * Handle create user to follow requests
  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async requestToFollowUser(
    @Args('targetUserId') targetUserId: string,
    @GqlCurrentUser() { user },
  ): Promise<User> {
    const {
      payload: { _id },
    } = user;

    const userRequest = await this.userService.requestToFollowUser(
      _id,
      targetUserId,
    );

    return userRequest;
  }

  // * Handle decline request
  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async declineUserRequest(
    @Args('targetUserId') targetUserId: string,
    @GqlCurrentUser() { user },
  ): Promise<User> {
    const {
      payload: { _id },
    } = user;

    const userRequest = await this.userService.removesUserRequest(
      _id,
      targetUserId,
    );

    return userRequest;
  }

  // * Handle to accept follower
  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async acceptFollowRequest(
    @Args('targetUserId') targetUserId: string,
    @GqlCurrentUser() { user },
  ): Promise<User> {
    const {
      payload: { _id },
    } = user;

    const userRequest = await this.userService.acceptsUserRequestToFollow(
      _id,
      targetUserId,
    );

    return userRequest;
  }
  // * Handle use toUnfollow
  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async removeUserFollowing(
    @Args('targetUserId') targetUserId: string,
    @GqlCurrentUser() { user },
  ): Promise<User> {
    const {
      payload: { _id },
    } = user;

    const userRequest = await this.userService.removeUserFollowing(
      _id,
      targetUserId,
    );

    return userRequest;
  }

  // * Handle remove a Follower
  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async removeUserFollower(
    @Args('targetUserId') targetUserId: string,
    @GqlCurrentUser() { user },
  ): Promise<User> {
    const {
      payload: { _id },
    } = user;

    const userRequest = await this.userService.removeUserFollower(
      _id,
      targetUserId,
    );

    return userRequest;
  }
}
