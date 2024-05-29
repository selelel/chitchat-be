import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { BCRYPT } from 'src/utils/constant';
import { UserInput } from './dto/user.input.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User } from './entities/user.entity';
import { ConflictError } from 'src/core/error/graphql.error';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findAll(): Promise<User[]> {
    const allUser = await this.userModel.find().populate('chats');
    return allUser;
  }

  async findOneById(_id: string): Promise<User> {
    return await this.userModel.findOne({ _id });
  }

  async findEmail(email: string): Promise<User> {
    return await this.userModel.findOne({ email });
  }

  async createUser(user: UserInput): Promise<User> {
    try {
      const userExist = await this.userModel.findOne({ email: user.email });

      if (userExist) {
        throw new ConflictError('User with this email already exists');
      }

      const newUser = await this.userModel.create({
        ...user,
        password: await bcrypt.hash(user.password, BCRYPT.salt),
      });

      return newUser;
    } catch (error) {
      return error;
    }
  }

  async requestToFollowUser(
    requestingUserId: mongoose.Schema.Types.ObjectId,
    targetUserId: mongoose.Schema.Types.ObjectId,
  ): Promise<User> {
    try {
      const [_requestingUserId, _targetUserId] = await Promise.all([
        this.userModel.findOne({ _id: requestingUserId }),
        this.userModel.findOne({ _id: targetUserId }),
      ]);

      await Promise.all([
        _requestingUserId.requests.toFollowings.push(targetUserId),
        _targetUserId.requests.toFollowers.push(requestingUserId),
      ]);

      await _targetUserId.save();
      return await _requestingUserId.save();
    } catch (error) {
      return error;
    }
  }

  async declinesRequestToFollowUser(
    decliningUserId: mongoose.Schema.Types.ObjectId,
    targetUserId: mongoose.Schema.Types.ObjectId,
  ): Promise<User> {
    try {
      const [_decliningUser, _targetUser] = await Promise.all([
        this.userModel.findOne({ _id: decliningUserId }),
        this.userModel.findOne({ _id: targetUserId }),
      ]);

      const _declining_toFollower = _decliningUser.requests.toFollowers.filter(
        (d) => d !== targetUserId,
      );

      const _targetUser_toFollowing = _targetUser.requests.toFollowings.filter(
        (d) => d !== decliningUserId,
      );

      _decliningUser.requests.toFollowers = _declining_toFollower;
      _targetUser.requests.toFollowers = _targetUser_toFollowing;

      await _targetUser.save();
      return await _decliningUser.save();
    } catch (error) {
      return error;
    }
  }
}
