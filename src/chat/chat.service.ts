import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chat } from './entities/chat.entity';
import { User } from 'src/user/entities/user.entity';
import { ObjectId } from 'mongodb';
import { Message } from './entities/message.entity';
import { CreatePrivateMessage } from './dto/create.private-message';
import { GetConversation } from './dto/conversation.dto';
import { ChatValidateUser } from './dto/chatvalidateuser.dto';
import { Model } from 'mongoose';
import { ConflictError, UnauthorizedError } from 'src/utils/error/global.error';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
    private usersService: UserService,
  ) {}
  async privateChats(getConversation: GetConversation): Promise<Message[]> {
    try {
      const message = await this.messageModel
        .find({ chatId: getConversation.chatId })
        .sort({ createdAt: -1 })
        .skip(getConversation.pagination.skip || 0)
        .limit(getConversation.pagination.limit || 2)
        .populate('userId');

      return message;
    } catch (error) {
      return error;
    }
  }

  async createPrivateRoom(_user1: string, _user2: string): Promise<Chat> {
    const privateRoomId = new ObjectId();
    const [user1, user2] = await Promise.all([
      this.userModel.findOne({ _id: _user1 }),
      this.userModel.findOne({ _id: _user2 }),
    ]);

    if (!user1 || !user2) {
      throw new NotFoundException('User not found');
    }

    const privateRoom = new this.chatModel({
      _id: privateRoomId,
      usersId: [user1, user2],
    });

    await Promise.all([
      user1.updateOne({ $push: { chats: privateRoomId } }),
      user2.updateOne({ $push: { chats: privateRoomId } }),
    ]);

    return await privateRoom.save();
  }

  async createUsersRoom(userIds: string[]): Promise<Chat> {
    const users = [];

    for (const userId of userIds) {
      try {
        const user = await this.isChatExisted(userId);
        users.push(user._id);
      } catch (error) {
        console.log(error);
      }
    }

    const room = await this.chatModel.create({
      usersId: users,
    });

    return room;
  }

  // Todo create test here
  async addUserOnRoom(chatId: string, _targetUser: string): Promise<Chat> {
    await this.usersService.isUserExisted(_targetUser);
    await this.isChatExisted(chatId);

    await this.userModel.findByIdAndUpdate(_targetUser, {
      $push: { chats: chatId },
    });

    const room = await this.chatModel.findByIdAndUpdate(chatId, {
      $push: { usersId: chatId },
    });

    return room;
  }

  async sendMessage(
    user: string,
    messagePayload: CreatePrivateMessage,
  ): Promise<Message> {
    try {
      const chat = await this.chatModel.findOne({ _id: messagePayload.chatId });
      if (!chat) throw new UnauthorizedError();

      const payload = {
        chatId: messagePayload.chatId,
        userId: user,
        content: messagePayload.content,
      };

      const message = await this.messageModel.create(payload);
      await message.save();

      await chat.updateOne({ $push: { messages: message._id } });
      return message.populate('userId');
    } catch (error) {
      return error;
    }
  }

  async validateUserIsOnChat(validate: ChatValidateUser): Promise<boolean> {
    try {
      const chat = await this.chatModel.findById({ _id: validate.chatId });

      if (!chat.usersId.includes(validate.userId)) throw new Error();

      return Promise.resolve(true);
    } catch (error) {
      return Promise.resolve(false);
    }
  }

  async isChatExisted(_id: string) {
    const chat = await this.chatModel.findById(_id);
    if (!chat) throw new ConflictError('Chat not found');

    return chat;
  }
}
