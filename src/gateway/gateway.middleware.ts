import { Socket } from 'socket.io';
import { UnauthorizedError } from 'src/utils/error/global.error';
import { AuthService } from 'src/auth/auth.service'; // Adjust path as needed
import { UserService } from 'src/user/user.service'; // Adjust path as needed
import { Status } from 'src/user/enums'; // Adjust path as needed

export class GatewayMiddleware {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  async middleware(socket: Socket, next: (err?: any) => void) {
    const token = socket.handshake.headers.authorization?.split(' ')[1];

    try {
      const user = await this.authenticateSocket(token);
      socket.data.user = user;
      next();
    } catch (error) {
      this.handleDisconnect(socket);
      next(error);
    }
  }

  private async authenticateSocket(token: string): Promise<any> {
    if (!token) {
      throw new UnauthorizedError();
    }

    const tokenDecoded = await this.authService.decodeToken(token);

    if (!(await this.authService.validateToken(token))) {
      throw new UnauthorizedError();
    }

    return tokenDecoded.payload;
  }

  async handleDisconnect(socket: Socket) {
    const { user } = socket.data;
    if (user) {
      const {
        payload: { _id },
      } = user;
      await this.userService.updateUserStatus(_id, Status.OFFLINE);
    }
  }
}
