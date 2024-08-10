import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { Passport } from 'passport';
import { AuthService } from 'src/auth/auth.service';
import { ChatService } from 'src/chat/chat.service';
import { ChatModule } from 'src/chat/chat.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    Passport,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ChatModule,
    AuthModule,
  ],
  exports: [UserService],
  providers: [UserService, UserResolver],
})
export class UserModule {}
