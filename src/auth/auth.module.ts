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

@Module({
  imports: [JwtModule.register({
    secret: JWT.JWT_SECRET_KEY,
    signOptions: { expiresIn: JWT.JWT_EXPIRE_IN },
  }),
    PassportModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [AuthService, AuthResolver, UserService, JwtStrategy, GoogleStrategy],
  exports:[JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
