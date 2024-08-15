import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT } from 'src/utils/constant/constant';
import { UserService } from 'src/user/user.service';
import { JwtPayload } from '../dto/jwt_payload.dto';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT.JWT_SECRET_KEY,
    });
  }

  async validate(payload: JwtPayload, done: Function) {
    console.log(payload)
    try {
      const user = await this.userService.findById(payload._id);
      if (!user || !payload) {
        throw new UnauthorizedException();
      }
      done(null, user);
    } catch (error) {
      console.error('Error during JWT validation:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
