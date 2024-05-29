import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server } from 'socket.io';
import { OnModuleInit, UseGuards } from '@nestjs/common';
import { SocketAuthGuard } from 'src/auth/guards/socket.auth.guard';
import { SocketCurrentUser } from 'src/auth/decorator/socket.current.user';
import { CreatePrivateMessage } from './dto/create.private-message';
import { UserService } from 'src/user/user.service';

@WebSocketGateway()
export class ChatGateway implements OnModuleInit {
  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService,
  ) {}

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(socket.id);
      console.log('Connected');
    });
  }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('newMessage')
  @UseGuards(SocketAuthGuard)
  async testMessage(@MessageBody() body: any) {
    await this.chatService.createPrivateRoom('6655c4589b713cbcd819f298', body);
    this.server.emit('onMessage', body);
  }

  @SubscribeMessage('sendDirectMessage')
  @UseGuards(SocketAuthGuard)
  async sendDirectMessage(
    @SocketCurrentUser() { user },
    @MessageBody() createPrivateMessage: CreatePrivateMessage,
  ) {
    try {
      const message = await this.chatService.sendMessage(
        user.payload._id,
        createPrivateMessage,
      );

      const validateUser = await this.chatService.validateUserIsOnChat({
        userId: user.payload._id,
        chatId: createPrivateMessage.chatId,
      });

      if (validateUser !== true) throw validateUser;

      this.server.emit(createPrivateMessage.chatId, message.content);
    } catch (error) {
      this.server.emit(createPrivateMessage.chatId, error);
    }
  }
}
