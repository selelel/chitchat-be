import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MongodbService } from './services/database/mongodb/mongodb.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    UserModule,
    MongooseModule.forRoot(
      `mongodb://127.0.0.1:${process.env.DB_PORT}/chitchat`,
    ),
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService, MongodbService],
})
export class AppModule {}
