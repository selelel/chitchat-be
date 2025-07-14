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
import { AuthService } from 'src/auth/auth.service';
import { ChatMiddleware } from './chat.middleware';
import { MessageContentInput } from './dto/message.content_input';
import { CHAT_PORT } from 'src/utils/constant/constant';

@WebSocketGateway(CHAT_PORT, {
  cors: {
    methods: ["GET", "POST"],
    allowedHeaders: ["chatid"],
    credentials: true
  }
})
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
  @ConnectedSocket() connect: Socket,
) {
  const { user, chatId } = connect.data;
  connect.join(chatId); 

  try {
    const message = await this.chatService.sendMessage(
      chatId,
      user.payload._id,
      messageContent,
    );

    // ✅ Emit to specific room
    this.server.to(chatId).emit('onListening', message);

  } catch (error) {
    this.server.to(chatId).emit('onListening', error);
  }
}

  @SubscribeMessage('unsentDirectMessage')
  async unsentDirectMessage(@MessageBody() { messageId }) {
    try {
      const message = await this.chatService.unsentMessage(messageId);
      this.server.emit(
        'onListening',
        `Unsent ${message._id}-${message.content}`,
      );
    } catch (error) {
      this.server.emit('onListening', error);
    }
  }
}
