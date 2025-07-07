import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserInput } from './dto/user.input.dto';
import { User } from './entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql.auth.guard';
import { GqlCurrentUser } from 'src/auth/decorator/gql.current.user';
import { ChatService } from 'src/chat/chat.service';
import { GetCurrentUser } from 'src/auth/interfaces/jwt_type';
import mongoose from 'mongoose';
import { Pagination } from 'src/utils/global_dto/pagination.dto';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly chatService: ChatService,
  ) {}

  @Query(() => [User])
  async testQuery(): Promise<User[]> {
    return await this.userService.findAll();
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async getUserInfoByUsername(
    @Args('username') username: string,
  ): Promise<User> {
    const user = await this.userService.findByUsername(username);
    return user;
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async getUserInfo(
    @GqlCurrentUser() { decoded_token }: GetCurrentUser,
  ): Promise<User> {
    const user = await this.userService.findById(decoded_token.payload._id);
    return user;
  }

  @Query(() => [User])
  @UseGuards(GqlAuthGuard)
  async getFriendSuggestion(
    @Args('pagination') pagination: Pagination,
    @GqlCurrentUser() { decoded_token }: GetCurrentUser,
  ): Promise<User[]> {
    const user = await this.userService.getFriendSuggestion((decoded_token.payload._id.toString()), pagination);
    return user;
  }

  @Mutation(() => [User])
  @UseGuards(GqlAuthGuard)
  async getManyUserInfo(
    @Args('id', { type: () => [String] }) ids: string[],
  ): Promise<User[]> {
    try {
      const user = await this.userService.findManyById(ids);
      return user;
    } catch (error) {
      return error
    }
  }

  @Mutation(() => User)
  async createUser(
    @Args('createUserInput') createUserInput: UserInput,
  ): Promise<User> {
    const createdUser = await this.userService.createUser(createUserInput);
    return createdUser;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async followUser(
    @Args('targetUserId') targetUserId: string,
    @GqlCurrentUser() { decoded_token }: GetCurrentUser,
  ): Promise<Boolean> {
    try {
      await this.userService.requestToFollowUser(
        decoded_token.payload._id.toString(),
        targetUserId,
      );
      return true;
    } catch (error) {
      return error
    }
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async cancelFollowRequest(
    @Args('targetUserId') targetUserId: string,
    @GqlCurrentUser() { decoded_token }: GetCurrentUser,
  ): Promise<Boolean> {
    try {
      await this.userService.removesUserRequest(
        targetUserId,
        decoded_token.payload._id.toString()
      );
      return true;
    } catch (error) {
      return error
    }
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async declineFollowRequest(
    @Args('targetUserId') targetUserId: string,
    @GqlCurrentUser() { decoded_token }: GetCurrentUser,
  ): Promise<Boolean> {
    try {
      await this.userService.removesUserRequest(
        decoded_token.payload._id.toString(),
        targetUserId,
      );
      return true;
    } catch (error) {
      return error
    }
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async acceptFollowRequest(
    @Args('targetUserId') targetUserId: string,
    @GqlCurrentUser() { decoded_token }: GetCurrentUser,
  ): Promise<Boolean> {
    try {
      await this.userService.acceptsUserRequestToFollow(
        decoded_token.payload._id.toString(),
        targetUserId,
      );

      // await this.chatService.createPrivateRoom(
      //   decoded_token.payload._id,
      //   targetUserId,
      // );
      return true;
    } catch (error) {
      return error;
    }
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async removeUserFollowing(
    @Args('targetUserId') targetUserId: string,
    @GqlCurrentUser() { decoded_token },
  ): Promise<Boolean> {
    try {
      const {
        payload: { _id },
      } = decoded_token;

      await this.userService.removeUserFollowing(
        _id,
        targetUserId,
      );
  
      return true;
    } catch (error) {
      return error
    }
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async removeUserFollower(
    @Args('targetUserId') targetUserId: string,
    @GqlCurrentUser() { decoded_token },
  ): Promise<Boolean> {
    try {
      const {
        payload: { _id },
      } = decoded_token;
  
      await this.userService.removeUserFollower(
        _id,
        targetUserId,
      );
  
      return true;
    } catch (error) {
      return error
    }
  }
}
