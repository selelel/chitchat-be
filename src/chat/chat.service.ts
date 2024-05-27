import { Injectable } from '@nestjs/common';
import { Chat } from './entities/chat.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ChatService {
  constructor(@InjectModel(Chat.name) private chatModel: Model<Chat>) {}
  async createChat(users: any): Promise<Chat> {
    const newChat = new this.chatModel(users);
    return newChat.save();
  }

  findAll() {
    return `This action returns all chat`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chat`;
  }

  update(id: number, updateChatDto: string) {
    return `This action updates a #${id} ${updateChatDto} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
