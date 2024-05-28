import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ChatService } from './chat.service';
import { Chat } from './entities/chat.entity';
import { UseGuards } from '@nestjs/common';
import { GqlCurrentUser } from 'src/auth/decorator/gql.current.user';

@Resolver()
export class ChatResolver {
  constructor(private readonly chatService: ChatService) {}

  @Mutation(() => Chat)
  async createChat(@Args('recipientId') recipientId: string): Promise<Chat> {
    const createChat = this.chatService.createPrivateRoom(
      ' user.payload._id',
      recipientId,
    );

    return createChat;
  }

  @Query(() => [Chat])
  @UseGuards(GqlCurrentUser)
  async privateChatsCreated(@GqlCurrentUser() { user }): Promise<Chat> {
    const chat = await this.chatService.privateChats(user.payload._id);
    console.log(chat);
    return chat;
  }
}
