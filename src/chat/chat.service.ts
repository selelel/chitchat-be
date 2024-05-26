import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  create(createChatDto: string) {
    return createChatDto;
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
