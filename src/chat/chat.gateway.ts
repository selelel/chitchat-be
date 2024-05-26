import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';
import { ObjectId } from 'mongodb';

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
    const testChatData = [new ObjectId('66535e2b1e769d7bd4319202')];

    console.log(await this.chatService.createChat(testChatData));
    this.server.emit('onMessage', body);
  }
}
