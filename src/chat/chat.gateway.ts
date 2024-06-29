import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { ChatMiddleware } from './chat.middleware';
import { MessageContentInput } from './dto/message.content_input';

@WebSocketGateway(8585)
export class ChatGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;
  private readonly middleware: ChatMiddleware;
  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
  ) {
    this.middleware = new ChatMiddleware(authService, chatService);
  }

  onModuleInit() {
    this.server.use(this.middleware.middleware.bind(this));
  }

  @SubscribeMessage('sendDirectMessage')
  async sendDirectMessage(
    @MessageBody() messageContent: MessageContentInput,
    @ConnectedSocket() connect,
  ) {
    const { user, chatId } = connect.data;
    try {
      const message = await this.chatService.sendMessage(
        chatId,
        user.payload._id,
        messageContent,
      );
      this.server.emit('onListening', `${message._id}-${message.content.text}`);
    } catch (error) {
      this.server.emit('onListening', error);
    }
  }
}
