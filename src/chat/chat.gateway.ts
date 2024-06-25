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
import { CreatePrivateMessage } from './dto/create.private-message';
import { AuthService } from 'src/auth/auth.service';
import { ChatMiddleware } from './chat.middleware';

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
    @MessageBody() body: CreatePrivateMessage,
    @ConnectedSocket() connect,
  ) {
    const { user, chatId } = connect.data;
    try {
      body.chatId = chatId;
      const message = await this.chatService.sendMessage(
        user.payload._id,
        body,
      );
      this.server.emit('onListening', message.content);
    } catch (error) {
      this.server.emit('onListening', error);
    }
  }
}
