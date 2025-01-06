import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ChatService } from './chat.service';
import { Chat } from './entities/chat.entity';
import { UseGuards } from '@nestjs/common';
import { GqlCurrentUser } from 'src/auth/decorator/gql.current.user';
import { GqlAuthGuard } from 'src/auth/guards/gql.auth.guard';
import { Message } from './entities/message.entity';
import { GetConversation } from './dto/conversation.dto';

@Resolver()
export class ChatResolver {
  constructor(private readonly chatService: ChatService) {}

  @Mutation(() => Chat)
  @UseGuards(GqlAuthGuard)
  async createChatRoom(
    @Args('recipientId') recipientId: string,
    @GqlCurrentUser() { decoded_token },
  ): Promise<Chat> {
    const createdChat = await this.chatService.createPrivateRoom(
      decoded_token.payload._id,
      recipientId,
    );

    return createdChat;
  }

  @Mutation(() => Chat)
  @UseGuards(GqlAuthGuard)
  async getUserPrivateChatRoom(
    @Args('targetUser') targetUser: string,
    @GqlCurrentUser() { decoded_token },
  ): Promise<Chat> {
    try {
      const room = await this.chatService.usersPrivateChatFinder(
        targetUser,
        decoded_token.payload._id,
      );
      return room;
    } catch (error) {
      return error;
    }
  }

  @Mutation(() => [Message])
  @UseGuards(GqlAuthGuard)
  async getChatConversation(
    @Args('conversationInput') conversationInput: GetConversation,
    @GqlCurrentUser() { decoded_token },
  ): Promise<Message[]> {
    try {
      const isValidUser = await this.chatService.validateUserIsOnChat({
        userId: decoded_token.payload._id,
        chatId: conversationInput.chatId,
      });

      if (isValidUser !== true) {
        throw isValidUser;
      }
      return await this.chatService.privateChats(conversationInput);
    } catch (error) {
      return error;
    }
  }
}
