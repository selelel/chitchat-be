import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserInput } from './dto/user.input.dto';
import { User } from './entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql.auth.guard';
import { GqlCurrentUser } from 'src/auth/decorator/gql.current.user';
import { ChatService } from 'src/chat/chat.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService, private readonly chatService: ChatService, ) {}

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

    // create private chat is there is it isn't created.
    await this.chatService.createPrivateRoom(_id, targetUserId)
    return userRequest;
  }

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
