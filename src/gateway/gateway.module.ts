import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { GatewayGateway } from './gateway.gateway';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from 'src/chat/entities/chat.entity';
import { User, UserSchema } from 'src/user/entities/user.entity';
import { Message, MessageSchema } from 'src/chat/entities/message.entity';

@Module({
  imports: [
    PassportModule,
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: Message.name, schema: MessageSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [GatewayGateway, GatewayService],
})
export class GatewayModule {}
