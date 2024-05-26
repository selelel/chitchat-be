import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private chatRepository: Repository<Chat>,
  ) {}
  async createChat(users: any): Promise<Chat> {
    const newChat = new Chat();
    newChat.users = users; // Assign user IDs directly

    return await this.chatRepository.save(newChat); // Save the chat with user IDs
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
