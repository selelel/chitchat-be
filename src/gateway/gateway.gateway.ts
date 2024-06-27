// gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, OnModuleInit } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service'; // Adjust path as needed
import { UserService } from 'src/user/user.service'; // Adjust path as needed
import { GatewayService } from './gateway.service';
import { GatewayMiddleware } from './gateway.middleware';
import { Status } from 'src/user/enums';

@WebSocketGateway()
export class Gateway
  implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly middleware: GatewayMiddleware;

  constructor(
    @Inject(GatewayService) private readonly gatewayService: GatewayService,
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(UserService) private readonly userService: UserService,
  ) {
    this.middleware = new GatewayMiddleware(authService, userService);
  }

  onModuleInit() {
    this.server.use(this.middleware.middleware.bind(this.middleware));
  }

  async handleConnection(socket: Socket) {
    const { user } = socket.data;
    const {
      user: { username },
    } = await this.userService.findOneById(user._id);

    try {
      await this.userService.updateUserStatus(user._id, Status.ONLINE);
      this.notifyFriends(user._id, `User ${username} is online`);
    } catch (error) {
      console.log(error);
    }
  }

  async handleDisconnect(socket: Socket) {
    const { user } = socket.data;
    const {
      user: { username },
    } = await this.userService.findOneById(user._id);

    try {
      this.notifyFriends(user._id, `User ${username} is offline`);
    } catch (error) {
      console.log(error);
    }
  }

  async notifyFriends(_id: string, message: string) {
    const userRecord = await this.userService.findOneById(_id);
    const { followers, following } = userRecord;
    [...followers, ...following].forEach((friend) => {
      this.server.emit(friend.toString(), message);
    });
  }
}
