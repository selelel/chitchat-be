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

@WebSocketGateway()
export class ChatGateway implements OnModuleInit {
  constructor(private readonly chatService: ChatService) {}
  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(socket.id);
      console.log('Connected');
    });
  }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('newMessage')
  async testMessage(@MessageBody() body: any) {
    await this.chatService.createPrivateRoom('665580f32c6cfb62fbadc73c', body);
    this.server.emit('onMessage', body);
  }
  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('newPrivateMassage')
  async privateMessage(@MessageBody() body: any) {
    await this.chatService.createPrivateRoom('665580f32c6cfb62fbadc73c', body);
    this.server.emit('onMessage', body);
  }
}
