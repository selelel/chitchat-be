import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { User } from './dto/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { userInput } from './dto/user.input';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private UserModel: Model<User>,
  ) {}

  async create(user: userInput): Promise<User> {
    return (await this.UserModel.create(user)).save();
  }

  async findOne(p0: { _id: string }): Promise<User[]> {
    return await this.UserModel.find({ _id: p0._id });
  }
}
