import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { BCRYPT } from 'src/utils/constant';
import { UserInput } from './dto/user.input.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import { ObjectId } from 'mongodb';
import { ConflictError, UnauthorizedError } from 'src/core/error/graphql.error';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

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
      if (await this.isUserAlreadyFollowed(userId, targetUserId)) {
        throw new ConflictError('User is already on Following');
      }

      const userUpdate = await this.userModel.updateOne(
        { _id: userId },
        {
          $addToSet: { 'requests.toFollowings': new ObjectId(targetUserId) },
        },
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
        .populate(['requests.toFollowers', 'requests.toFollowings']);
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
        { $pull: { 'requests.toFollowers': targetUserId } },
      );

      const targetUpdate = await this.userModel.updateOne(
        { _id: targetUserId },
        { $pull: { 'requests.toFollowings': userId } },
      );

      if (userUpdate.modifiedCount === 0 || targetUpdate.modifiedCount === 0) {
        throw new ConflictError(
          'Failed to remove user requests one or both users',
        );
      }

      return await this.userModel
        .findOne({ _id: userId })
        .populate(['requests.toFollowers', 'requests.toFollowings']);
    } catch (error) {
      throw error;
    }
  }

  async acceptsUserRequestToFollow(
    userId: string,
    targetUserId: string,
  ): Promise<User> {
    try {
      if (!(await this.isUserToAccept(userId, targetUserId)))
        throw new UnauthorizedError("User can't accept to following");

      await this.removesUserRequest(userId, targetUserId);

      const userUpdate = await this.userModel.updateOne(
        { _id: userId },
        { $addToSet: { followers: targetUserId } },
      );

      const targetUpdate = await this.userModel.updateOne(
        { _id: targetUserId },
        { $addToSet: { following: userId } },
      );

      if (userUpdate.modifiedCount === 0 || targetUpdate.modifiedCount === 0) {
        throw new ConflictError('Failed to update one or both users');
      }

      return await this.userModel
        .findOne({ _id: userId })
        .populate('followers');
    } catch (error) {
      throw error;
    }
  }

  async removeUserFollower(
    userId: string,
    targetUserId: string,
  ): Promise<User> {
    try {
      const targetUserIdObject = new ObjectId(targetUserId);
      const user = await this.userModel.findOne({
        _id: userId,
        followers: { $in: [targetUserIdObject] },
      });

      if (!user) throw new UnauthorizedError('User not a follower');

      const userUpdate = await this.userModel.updateOne(
        { _id: userId },
        { $pull: { followers: targetUserId } },
      );

      const targetUpdate = await this.userModel.updateOne(
        { _id: targetUserId },
        { $pull: { following: userId } },
      );

      if (userUpdate.modifiedCount === 0 || targetUpdate.modifiedCount === 0) {
        throw new ConflictError('Failed to update one or both users');
      }

      return await this.userModel
        .findOne({ _id: userId })
        .populate('followers');
    } catch (error) {
      throw error;
    }
  }

  async removeUserFollowing(
    userId: string,
    targetUserId: string,
  ): Promise<User> {
    try {
      const targetUserIdObject = new ObjectId(targetUserId);
      const user = await this.userModel.findOne({
        _id: userId,
        following: { $in: [targetUserIdObject] },
      });

      if (!user) throw new UnauthorizedError('User not followed');

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

      return (await this.userModel.findOne({ _id: userId })).populate(
        'following',
      );
    } catch (error) {
      throw error;
    }
  }

  // Helper Function
  async findAll(): Promise<User[]> {
    const allUser = await this.userModel.find().populate('chats');
    return allUser;
  }

  async findOneById(_id: string): Promise<User> {
    try {
      return await this.userModel
        .findOne({ _id })
        .populate(['requests.toFollowers', 'requests.toFollowings']);
    } catch (error) {
      return error;
    }
  }

  async findEmail(email: string): Promise<User> {
    return await this.userModel.findOne({ email });
  }

  async isUserToAccept(_id: string, targetUserId: string) {
    try {
      const targetUserIdObject = new ObjectId(targetUserId);

      const user = await this.userModel.findOne({
        _id,
        'requests.toFollowers': { $in: [targetUserIdObject] },
      });

      if (!user) {
        return false;
      }

      return true;
    } catch (error) {
      return null;
    }
  }

  async isUserAlreadyFollowed(_id: string, targetUserId: string) {
    try {
      const targetUserIdObject = new ObjectId(targetUserId);

      const user = await this.userModel.findOne({
        _id,
        following: { $in: [targetUserIdObject] },
      });

      if (!user) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async isUserExisted(_id: string) {
    const user = await this.userModel.findOne({ _id });

    if (!user) throw new ConflictError('User not Found');
  }
}
