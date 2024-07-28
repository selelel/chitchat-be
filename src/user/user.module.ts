import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { Passport } from 'passport';
import { AuthService } from 'src/auth/auth.service';

@Module({
  imports: [
    Passport,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  exports: [UserService],
  providers: [UserService, UserResolver, AuthService, {
    provide: "UserService", useClass: UserService
  }],
})
export class UserModule {}
