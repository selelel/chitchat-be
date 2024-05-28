import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';

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
    await this.chatService.createChatWithUser('665580f32c6cfb62fbadc73c', body);
    this.server.emit('onMessage', body);
  }
}
