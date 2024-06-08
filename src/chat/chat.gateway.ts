import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';
import { CreatePrivateMessage } from './dto/create.private-message';
import { AuthService } from 'src/auth/auth.service';
import { UnauthorizedError } from 'src/core/error/global.error';

@WebSocketGateway(8585)
export class ChatGateway implements OnModuleInit {
  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
  ) {}

  onModuleInit() {
    this.server.use(async (socket: Socket, next: (err?: any) => void) => {
      const token = socket.handshake.headers.authorization?.split(' ')[1];
      const chatId = socket.handshake.headers.chatid as string;
      const tokenDecoded = await this.authService.decodeToken(token);
      try {
        if (
          !token ||
          !(await this.authService.validateToken(token)) ||
          !(await this.chatService.validateUserIsOnChat({
            userId: tokenDecoded.payload._id,
            chatId: chatId,
          }))
        ) {
          throw new UnauthorizedError();
        }
        socket.data.chatId = chatId;
        socket.data.user = tokenDecoded;

        next();
      } catch (error) {
        socket.on('disconnect', () => {});
        next(error);
      }
    });
  }

  @WebSocketServer()
  server: Server;

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
