import { Inject, Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(
    @Inject('UserService') private readonly userService: UserService,
  ) {
    super();
  }

  async serializeUser(user: any, done: Function) {
    done(null, user);
  }
  async deserializeUser(payload: any, done: Function) {
    const user = await this.userService.findEmail(payload.email);
    return user ? done(null, user) : done(null, null);
  }
}
