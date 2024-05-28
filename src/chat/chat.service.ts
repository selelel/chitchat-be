import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from './entities/chat.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createChatWithUser(userId: string, title: string): Promise<Chat> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const createChat = new this.chatModel({
      usersId: [user._id],
      title: title,
    });
    await createChat.save();

    await user.updateOne({
      $push: {
        chats: createChat._id,
      },
    });
    return createChat;
  }
}
