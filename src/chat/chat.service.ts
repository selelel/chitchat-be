import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from './entities/chat.entity';
import { User } from 'src/user/entities/user.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createPrivateRoom(_user1: string, _user2: string): Promise<Chat> {
    // TODO find the optimize
    const privateRoomId = new ObjectId();
    const user1 = await this.userModel.findOne({
      _id: _user1,
    });

    const user2 = await this.userModel.findOne({
      _id: _user2,
    });

    console.log(user2, user1);

    if (!user1 || !user2) {
      throw new NotFoundException('User not found');
    }

    const privateRoom = new this.chatModel({
      _id: privateRoomId,
      usersId: [user1, user2],
      text: 'Hello, World!',
    });

    await user1.updateOne({
      $push: {
        chats: privateRoomId,
      },
    });

    await user2.updateOne({
      $push: {
        chats: privateRoomId,
      },
    });

    return await privateRoom.save();
  }
  async privateChats(_id: string): Promise<any> {
    const user = await this.userModel.findOne({ _id }).populate('chats');
    return user.chats;
  }
}
