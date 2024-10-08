import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JWT } from 'src/utils/constant/constant';
import { JwtStrategy } from './strategy/jwt.strategy';
import { GoogleStrategy } from './strategy/google.strategy';
import { SessionSerializer } from 'src/utils/helpers/auth.serializer';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    JwtModule.register({
      secret: JWT.ACCESSTOKEN_SECRET_KEY,
    }),
    PassportModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    AuthService,
    AuthResolver,
    UserService,
    JwtStrategy,
    GoogleStrategy,
    SessionSerializer,
    { provide: 'AuthService', useClass: AuthService },
    { provide: 'UserService', useClass: UserService },
  ],
  exports: [AuthService, JwtStrategy, UserService],
  controllers: [AuthController],
})
export class AuthModule {}
