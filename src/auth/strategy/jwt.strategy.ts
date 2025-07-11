import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT } from 'src/utils/constant/constant';
import { UserService } from 'src/user/user.service';
import { JwtPayload } from '../dto/jwt_payload.dto';
import { AuthService } from '../auth.service';
import { Decoded_JWT } from '../interfaces/jwt_type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT.ACCESSTOKEN_SECRET_KEY,
    });
  }

  async validate(jwt: Decoded_JWT, done: Function) {
    try {
      const user = await this.userService.findById(jwt.payload._id);
      if (!user || !jwt) {
        throw new UnauthorizedException();
      }
      done(null, user);
    } catch (error) {
      console.error('Error during JWT validation:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
