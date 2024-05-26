import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId, Repository } from 'typeorm';
import { ConflictError } from 'src/core/graphql.error';
import * as bcrypt from 'bcryptjs';
import { BCRYPT } from 'src/utils/constant';
import * as mongoDb from 'mongodb';
import { User } from './entities';
import { UserInput } from './dto/user.input.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async createUser(user: UserInput): Promise<User> {
    const userExist = await this.findEmail(user.email);
    // TODO Validate entity and password
    if (userExist) {
      throw new ConflictError('User with this email already exists');
    }
    const hash = await bcrypt.hash(user.password, BCRYPT.salt);
    user.password = hash;
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOneById(_id: ObjectId): Promise<User> {
    return await this.userRepository.findOne({
      where: { _id: new mongoDb.ObjectId(_id) },
    });
  }

  async findEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({ where: { email } });
  }
}
