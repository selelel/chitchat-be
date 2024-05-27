import { Injectable } from '@nestjs/common';
import { ConflictError } from 'src/core/graphql.error';
import * as bcrypt from 'bcryptjs';
import { BCRYPT } from 'src/utils/constant';
import { User } from './entities';
import { UserInput } from './dto/user.input.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(user: UserInput): Promise<User> {
    try {
      const userExist = await this.findEmail(user.email);

      if (userExist) {
        throw new ConflictError('User with this email already exists');
      }
      const hash = await bcrypt.hash(user.password, BCRYPT.salt);
      user.password = hash;
      const newUser = this.userModel.create({ _id: new ObjectId(), ...user });
      return newUser;
    } catch (error) {
      return error;
    }
  }

  async findAll(): Promise<User[]> {
    return await this.userModel.find();
  }

  async findOneById(_id: string): Promise<User> {
    return await this.userModel.findOne({ _id });
  }

  async findEmail(email: string): Promise<User> {
    return await this.userModel.findOne({ email });
  }
}
