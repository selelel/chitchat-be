import { Socket } from 'socket.io';
import { UnauthorizedError } from 'src/utils/error/global.error';
import { AuthService } from 'src/auth/auth.service';
import { ChatService } from './chat.service';

export class ChatMiddleware {
  constructor(
    private readonly authService: AuthService,
    private readonly chatService: ChatService,
  ) {}

  async middleware(socket: Socket, next: (err?: any) => void) {
    const token: string = socket.handshake.headers.authorization?.split(' ')[1] || socket.handshake.auth?.authorization.split(' ')[1];
    //! WTF IS THIS?!
    const chatId = socket.handshake.headers.chatid as string || socket.handshake.auth?.chatid || socket.handshake.query.chatid;
    const tokenDecoded = await this.authService.decodeToken(token);

    console.log(tokenDecoded, token, chatId, socket.handshake);

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
  }
}
