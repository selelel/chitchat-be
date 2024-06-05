import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ChatService } from 'src/chat/chat.service';
import { AuthService } from 'src/auth/auth.service';
import { Server, Socket } from 'socket.io';
import { UnauthorizedError } from 'src/core/error/global.error';
import { OnModuleInit } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { UserService } from 'src/user/user.service';

@WebSocketGateway()
export class Gateway implements OnModuleInit {
  constructor(
    private readonly gatewayService: GatewayService,
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.use(async (socket: Socket, next: (err?: any) => void) => {
      const token = socket.handshake.headers.authorization?.split(' ')[1];
      const tokenDecoded = await this.authService.decodeToken(token);
      try {
        if (!token || !(await this.authService.validateToken(token))) {
          throw new UnauthorizedError();
        }
        socket.data.user = tokenDecoded.payload;

        next();
      } catch (error) {
        socket.on('disconnect', () => {
          this.gatewayService.setUserInActive(tokenDecoded.payload._id);
        });
        next(error);
      }
    });

    this.server.on('connection', async (socket) => {
      const { user } = socket.data;
      const {
        user: { username },
      } = await this.userService.findOneById(user._id);

      try {
        await this.gatewayService.setUserActive(user._id);
        this.server.emit('onNotify', `User ${username} is online`);

        console.log(`User ${username} is online`);
        socket.on('disconnect', async () => {
          try {
            await this.gatewayService.setUserInActive(user._id);
            this.server.emit('onNotify', `User ${username} is disconnect`);
          } catch (error) {
            console.log(error);
          }
        });
      } catch (error) {
        console.log(error);
      }
    });
  }
}
