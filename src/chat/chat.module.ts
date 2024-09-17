import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatResolver } from './chat.resolver';
import { ChatGateway } from './chat.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from './entities/chat.entity';
import { Message, MessageSchema } from './entities/message.entity';
import { User, UserSchema } from 'src/user/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { BucketsService } from 'src/utils/utils_modules/third_party/buckets.service';
import { FileUploadService } from 'src/utils/utils_modules/services/file_upload.service';
import { ChatController } from './chat.controller';

@Module({
  imports: [
    PassportModule,
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: Message.name, schema: MessageSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  exports: [ChatService],
  providers: [
    ChatService,
    ChatResolver,
    ChatGateway,
    UserService,
    AuthService,
    FileUploadService,
    BucketsService,
  ],
  controllers: [ChatController],
})
export class ChatModule {}
