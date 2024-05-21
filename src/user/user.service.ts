import { Injectable } from '@nestjs/common';
import { userInput } from './dto/user.input';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId, Repository } from 'typeorm';
import { User } from './dto/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(user: userInput): Promise<User> {
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(_id: ObjectId): Promise<User> {
    return await this.userRepository.findOne({ where: { _id } });
  }

  async findEmail(email: string): Promise<User> {
    console.log('HEllo');
    return await this.userRepository.findOne({ where: { email } });
  }
}
