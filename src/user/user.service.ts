import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { BCRYPT } from 'src/utils/constant';
import { UserInput } from './dto/user.input.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import { ConflictError } from 'src/core/error/global.error';
import { ObjectId } from 'mongodb';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findAll(): Promise<User[]> {
    const allUser = await this.userModel.find().populate('chats');
    return allUser;
  }

  async findOneById(_id: string): Promise<User> {
    try {
      console.log('This is fine', _id);
      return await this.userModel
        .findOne({ _id })
        .populate('requests.toFollowers')
        .populate('user')
        .exec();
    } catch (error) {
      return error;
    }
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
    userId: string,
    targetUserId: string,
  ): Promise<User> {
    try {
      const userUpdate = await this.userModel.updateOne(
        { _id: userId },
        { $addToSet: { 'requests.toFollowings': new ObjectId(targetUserId) } },
      );

      const targetUpdate = await this.userModel.updateOne(
        { _id: targetUserId },
        { $addToSet: { 'requests.toFollowers': new ObjectId(userId) } },
      );

      if (userUpdate.modifiedCount === 0 || targetUpdate.modifiedCount === 0) {
        throw new ConflictError('Failed to update one or both users');
      }

      return await this.userModel
        .findOne({ _id: userId })
        .populate('requests.toFollowings', 'user email');
    } catch (error) {
      throw error;
    }
  }

  async removesUserRequest(
    userId: string,
    targetUserId: string,
  ): Promise<User> {
    try {
      const userUpdate = await this.userModel.updateOne(
        { _id: userId },
        { $pull: { 'requests.toFollowings': targetUserId } },
      );

      const targetUpdate = await this.userModel.updateOne(
        { _id: targetUserId },
        { $pull: { 'requests.toFollowers': userId } },
      );

      if (userUpdate.modifiedCount === 0 || targetUpdate.modifiedCount === 0) {
        throw new ConflictError('Failed to update one or both users');
      }

      return await this.userModel.findOne({ _id: userId });
    } catch (error) {
      throw error;
    }
  }

  async acceptsUserRequestToFollow(
    userId: string,
    targetUserId: string,
  ): Promise<User> {
    try {
      await this.removesUserRequest(userId, targetUserId);

      const userUpdate = await this.userModel.updateOne(
        { _id: userId },
        { $push: { followers: targetUserId } },
      );

      const targetUpdate = await this.userModel.updateOne(
        { _id: targetUserId },
        { $push: { following: userId } },
      );

      if (userUpdate.modifiedCount === 0 || targetUpdate.modifiedCount === 0) {
        throw new ConflictError('Failed to update one or both users');
      }

      return await this.userModel.findOne({ _id: userId });
    } catch (error) {
      throw error;
    }
  }

  async removeUserFollower(
    userId: string,
    targetUserId: string,
  ): Promise<User> {
    try {
      const userUpdate = await this.userModel.updateOne(
        { _id: userId },
        { $pull: { followers: targetUserId } },
      );

      const targetUpdate = await this.userModel.updateOne(
        { _id: targetUserId },
        { $push: { following: userId } },
      );

      if (userUpdate.modifiedCount === 0 || targetUpdate.modifiedCount === 0) {
        throw new ConflictError('Failed to update one or both users');
      }

      return await this.userModel.findOne({ _id: userId });
    } catch (error) {
      throw error;
    }
  }

  async removeUserFollowing(
    userId: string,
    targetUserId: string,
  ): Promise<User> {
    try {
      const userUpdate = await this.userModel.updateOne(
        { _id: userId },
        { $pull: { following: targetUserId } },
      );

      const targetUpdate = await this.userModel.updateOne(
        { _id: targetUserId },
        { $pull: { followers: userId } },
      );

      if (userUpdate.modifiedCount === 0 || targetUpdate.modifiedCount === 0) {
        throw new ConflictError('Failed to update one or both users');
      }

      return await this.userModel.findOne({ _id: userId });
    } catch (error) {
      throw error;
    }
  }
}
