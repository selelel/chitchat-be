import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { Gateway } from './gateway.gateway';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from 'src/chat/entities/chat.entity';
import { User, UserSchema } from 'src/user/entities/user.entity';
import { Message, MessageSchema } from 'src/chat/entities/message.entity';
import { AuthService } from 'src/auth/auth.service';
import { ChatService } from 'src/chat/chat.service';
import { UserService } from 'src/user/user.service';
import { GatewayMiddleware } from './gateway.middleware';
import { BucketsService } from 'src/utils/utils_modules/third_party/buckets.service';
import { FileUploadService } from 'src/utils/utils_modules/services/file_upload.service';

@Module({
  imports: [
    PassportModule,
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: Message.name, schema: MessageSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [
    Gateway,
    GatewayService,
    AuthService,
    ChatService,
    UserService,
    GatewayMiddleware,
    FileUploadService,
    BucketsService,
  ],
})
export class GatewayModule {}
