import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chat } from './entities/chat.entity';
import { User } from 'src/user/entities/user.entity';
import { ObjectId } from 'mongodb';
import { Message } from './entities/message.entity';
import { GetConversation } from './dto/conversation.dto';
import { ChatValidateUser } from './dto/chatvalidateuser.dto';
import mongoose, { Model } from 'mongoose';
import { ConflictError, UnauthorizedError } from 'src/utils/error/global.error';
import { UserService } from 'src/user/user.service';
import { MessageContentInput } from './dto/message.content_input';
import { FileUploadService } from 'src/utils/utils_modules/services/file_upload.service';
import { Category } from './interfaces/chat.category.enums';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
    private usersService: UserService,
    private fileUploadService: FileUploadService,
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

  async createPrivateRoom(
    _user1: mongoose.Schema.Types.ObjectId | string,
    _user2: mongoose.Schema.Types.ObjectId | string,
  ): Promise<Chat> {
    try {
      const privateRoomId = new ObjectId();
      const [user1, user2] = await Promise.all([
        this.userModel.findOne({ _id: _user1 }),
        this.userModel.findOne({ _id: _user2 }),
      ]);

      if (!user1 || !user2) {
        throw new NotFoundException('User not found');
      }
      // ! Might cause problem.
      if (await this.usersPrivateChatFinder(_user1, _user2)) {
        throw new ConflictError('Has already created room.');
      }

      const privateRoom = await this.chatModel.create({
        _id: privateRoomId,
        usersId: [user1, user2],
      });

      await Promise.all([
        user1.updateOne({ $push: { chats: privateRoomId } }),
        user2.updateOne({ $push: { chats: privateRoomId } }),
      ]);

      return privateRoom;
    } catch (error) {
      throw new ConflictError();
    }
  }

  async createUsersRoom(
    userIds: mongoose.Schema.Types.ObjectId[],
  ): Promise<Chat> {
    const users = [];

    for (const userId of userIds) {
      try {
        const user = await this.isChatExisted(userId);
        users.push(user._id);
      } catch (error) {
        throw new Error(error);
      }
    }

    const room = await this.chatModel.create({
      usersId: users,
    });

    for (const user of users) {
      await this.userModel.findByIdAndUpdate(user._id, {
        $push: { rooms: room._id },
      });
    }

    return room;
  }

  async addUserOnRoom(
    roomId: mongoose.Schema.Types.ObjectId,
    _targetUser: mongoose.Schema.Types.ObjectId,
  ): Promise<Chat> {
    await this.usersService.isUserExisted(_targetUser);
    await this.isChatExisted(roomId);

    await this.userModel.findByIdAndUpdate(_targetUser, {
      $push: { rooms: roomId },
    });

    const room = await this.chatModel.findByIdAndUpdate(roomId, {
      $push: { usersId: _targetUser },
    });

    return room;
  }

  async sendMessage(
    chatId: string,
    user: string,
    messagePayload: MessageContentInput,
  ): Promise<Message> {
    try {
      const chat = await this.chatModel.findOne({ _id: chatId });
      if (!chat) throw new UnauthorizedError();

      const payload = {
        chatId: chatId,
        userId: user,
        content: messagePayload,
      };

      const message = await this.messageModel.create(payload);
      await message.save();

      await chat.updateOne({ $push: { messages: message._id } });
      return message;
    } catch (error) {
      return error;
    }
  }

  async unsentMessage(messageId: string): Promise<Message> {
    try {
      const message = await this.messageModel.findById(messageId);
      if (!message) throw new ConflictError('Message not found');

      if (message.content.images) {
        await this.fileUploadService.removeFileImage(message.content?.images);
      }

      await message.updateOne(
        {
          content: false,
        },
        { new: true },
      );

      return message;
    } catch (error) {
      return error;
    }
  }

  async appendImageOnMessage(
    messageId: string,
    buffers: Buffer[],
  ): Promise<Message | boolean> {
    try {
      const images = await this.fileUploadService.uploadFileMessages(
        buffers,
        messageId,
        'png',
      );

      if (!images) {
        throw new ConflictError('Error processing image');
      }

      const message = await this.messageModel.findByIdAndUpdate(
        messageId,
        {
          'content.images': images,
        },
        { new: true },
      );

      return message;
    } catch (error) {
      return false;
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

  async isChatExisted(_id: mongoose.Schema.Types.ObjectId) {
    const chat = await this.chatModel.findById(_id);
    if (!chat) throw new ConflictError('Chat not found');

    return chat;
  }

  async isMessageExisted(_chatId: string, _messageId: string) {
    try {
      const chat = await this.chatModel.findById(_chatId);
      const message = chat.messages.includes(_messageId as unknown as Message);
      if (!message) throw new ConflictError('Chat not found');
      return true;
    } catch (error) {
      throw error;
    }
  }

  async verifyUserInMessage(messageId: string, userId: string) {
    const userMessage = await this.messageModel.findById(messageId, { userId });

    if (!userMessage) {
      throw new ConflictError('Message with user id not found');
    }
  }

  async usersPrivateChatFinder(
    userId1: mongoose.Schema.Types.ObjectId | string,
    userId2: mongoose.Schema.Types.ObjectId | string,
  ): Promise<Chat> {
    try {
      const detect = await this.chatModel.findOne({
        category: Category.PRIVATE,
        usersId: { $all: [userId1, userId2] },
      });
      return detect;
    } catch (error) {
      return error;
    }
  }
}
