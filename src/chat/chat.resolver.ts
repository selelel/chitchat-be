import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ChatService } from './chat.service';
import { Chat } from './entities/chat.entity';
import { UseGuards } from '@nestjs/common';
import { GqlCurrentUser } from 'src/auth/decorator/gql.current.user';
import { GqlAuthGuard } from 'src/auth/guards/gql.auth.guard';
import { Message } from './entities/message.entity';
import { GetConversation } from './dto/conversation.dto';
import { FileUpload, GraphQLUpload, Upload } from 'graphql-upload-ts';
import { FileUploadService } from 'src/utils/utils_modules/services/file_upload.service';

@Resolver()
export class ChatResolver {
  constructor(
    private readonly chatService: ChatService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async uploadImageOnMessage(
    @Args({ name: 'image', type: () => GraphQLUpload }) image: FileUpload,
    @Args('messageId') messageId: string,
    @GqlCurrentUser() { user },
  ): Promise<boolean> {
    try {
      const stream = image.createReadStream();
      console.log(image);
      const link = await this.chatService.appendImageOnMessage(messageId, [
        stream,
      ]);
      console.log(link.content);

      return true;
    } catch (error) {
      return error;
    }
  }
  @Mutation(() => Chat)
  @UseGuards(GqlAuthGuard)
  async createChat(
    @Args('recipientId') recipientId: string,
    @GqlCurrentUser() { user },
  ): Promise<Chat> {
    const createChat = await this.chatService.createPrivateRoom(
      user.payload._id,
      recipientId,
    );

    return createChat;
  }

  @Mutation(() => [Message])
  @UseGuards(GqlAuthGuard)
  async getConversation(
    @Args('getConversation') getConversation: GetConversation,
    @GqlCurrentUser() { user },
  ): Promise<Message[]> {
    try {
      const validateUser = await this.chatService.validateUserIsOnChat({
        userId: user.payload._id,
        chatId: getConversation.chatId,
      });

      if (validateUser !== true) {
        throw validateUser;
      }
      return await this.chatService.privateChats(getConversation);
    } catch (error) {
      return error;
    }
  }
}
