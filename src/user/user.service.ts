import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserInput } from './dto/user.input.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';
import { ObjectId } from 'mongodb';
import {
  ConflictError,
  UnauthorizedError,
} from 'src/utils/error/graphql.error';
import { Status } from './enums';
import { BCRYPT } from 'src/utils/constant/constant';
import { PassportProfile, UserProfile } from 'src/auth/dto/google_payload.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(user: UserInput): Promise<User> {
    try {
      const userExist = await this.userModel.findOne({
        $or: [
          { email: user.email },
          { username: user.username }
        ]
      });
      if (userExist) {
        throw new ConflictError('User with this email or username already exists');
      }

      const newUser = await this.userModel.create({
        ...user,
        password: await bcrypt.hash(user.password, BCRYPT.salt),
      });

      return newUser;
    } catch (error) {
      // Handle MongoDB duplicate key error
      if (error.code === 11000 && error.keyPattern && error.keyPattern.username) {
        throw new ConflictError('Username already exists');
      }
      if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
        throw new ConflictError('Email already exists');
      }
      throw error;
    }
  }

  async createGoggleAccountUser(details: UserProfile) {
    const { email, displayName, given_name, family_name } = details;

    let baseUsername = displayName.replaceAll(' ', '_').toLowerCase();
    let uniqueUsername = baseUsername;
    while (await this.userModel.findOne({ username: uniqueUsername })) {
      uniqueUsername = `${baseUsername}${Math.floor(Math.random() * 10000)}`;
    }

    const user_details = {
      firstname: given_name,
      lastname: family_name,
      username: uniqueUsername,
      hide_name: false,
    };

    try {
      const newUser = await this.userModel.create({
        user: user_details,
        email,
        username: uniqueUsername,
      });

      return newUser;
    } catch (error) {
      throw error;
    }
  }

  async requestToFollowUser(
    _id: mongoose.Schema.Types.ObjectId,
    targetUserId: string,
  ): Promise<User> {
    try {
      if (await this.isUserAlreadyFollowed(_id, targetUserId)) {
        throw new ConflictError('User is already on Following');
      }

      const userUpdate = await this.userModel.updateOne(
        { _id },
        {
          $addToSet: { 'requests.toFollowings': new ObjectId(targetUserId) },
        },
      );

      const targetUpdate = await this.userModel.updateOne(
        { _id: targetUserId },
        { $addToSet: { 'requests.toFollowers': _id } },
      );

      if (userUpdate.modifiedCount === 0 || targetUpdate.modifiedCount === 0) {
        throw new ConflictError('Failed to update one or both users');
      }

      return await this.userModel
        .findOne({ _id })
        .populate(['requests.toFollowers', 'requests.toFollowings']);
    } catch (error) {
      throw error;
    }
  }

  async removesUserRequest(
    userId: mongoose.Schema.Types.ObjectId,
    targetUserId: mongoose.Schema.Types.ObjectId,
  ): Promise<User> {
    try {
      await this.userModel.findByIdAndUpdate(
        userId,
        { $pull: { 'requests.toFollowers': targetUserId } },
        { new: true },
      );

      await this.userModel.findByIdAndUpdate(
        targetUserId,
        { $pull: { 'requests.toFollowings': userId } },
        { new: true },
      );

      return await this.userModel
        .findOne({ _id: userId })
        .populate(['requests.toFollowers', 'requests.toFollowings']);
    } catch (error) {
      throw error;
    }
  }

  async acceptsUserRequestToFollow(
    userId: mongoose.Schema.Types.ObjectId,
    targetUserId: mongoose.Schema.Types.ObjectId,
  ): Promise<User> {
    try {
      await this.isUserExisted(targetUserId);
      if (!(await this.isUserToAccept(userId, targetUserId)))
        throw new UnauthorizedError("User can't accept to following");

      await this.removesUserRequest(userId, targetUserId);

      await this.userModel.findByIdAndUpdate(
        userId,
        { $addToSet: { followers: targetUserId } },
        { new: true },
      );

      await this.userModel.findByIdAndUpdate(
        targetUserId,
        { $addToSet: { following: userId } },
        { new: true },
      );

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

  async userChangePassword(
    _id: mongoose.Schema.Types.ObjectId,
    oldPass: string | null,
    newPass: string,
    provider: 'jwt' | 'google' = 'jwt',
  ): Promise<boolean> {
    const user = await this.userModel.findById(_id);
    try {
      // Check if the old password is valid for non-Google users
      const isPasswordValid =
        (user.password === null && provider === 'google') ||
        (oldPass && (await bcrypt.compare(oldPass, user.password)));

      if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid password.');
      }

      if (oldPass === newPass) {
        throw new ConflictError(
          'The new password cannot be the same as the old password. Please choose a different password.',
        );
      }

      // Update the password
      await this.userModel.findByIdAndUpdate(_id, {
        password: await bcrypt.hash(newPass, BCRYPT.salt),
        token: [],
      });
      return true;
    } catch (e) {
      throw e; // Propagate the error
    }
  }

  // Helper Function
  async findById(_id?: mongoose.Schema.Types.ObjectId) {
    const user = await this.userModel.findById(_id)
    .populate(['posts.author', 'requests.toFollowers', 'requests.toFollowings', 'followers', 'following']);
    return user;
  }

  async findAll(): Promise<User[]> {
    const allUser = await this.userModel.find().exec();
    return allUser;
  }

  async findOneById(_id: string): Promise<User> {
    try {
      return await this.userModel
        .findOne({ _id })
        .populate(['requests.toFollowers', 'requests.toFollowings', 'posts.author'])
        .exec();
    } catch (error) {
      return error;
    }
  }
  async findByUsername(username: string): Promise<User> {
    try {
      return await this.userModel
        .findOne({ 'user.username': username })
        .populate(['followers', 'following'])
        .exec();
    } catch (error) {
      return error;
    }
  }


  async findEmail(email: string): Promise<User> {
    return await this.userModel.findOne({ email }).exec();
  }

  async isUserToAccept(
    _id: mongoose.Schema.Types.ObjectId,
    targetUserId: mongoose.Schema.Types.ObjectId,
  ) {
    try {
      const targetUserIdObject = targetUserId;

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

  async isUserAlreadyFollowed(
    _id: mongoose.Schema.Types.ObjectId,
    targetUserId: string,
  ) {
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

  async updateUserStatus(_id: string, status: Status): Promise<void> {
    await this.userModel.findByIdAndUpdate(_id, {
      status,
    });
  }

  async isUserExisted(_id: mongoose.Schema.Types.ObjectId): Promise<User> {
    const user = await this.userModel.findOne({ _id });
    if (!user) throw new ConflictError('User not Found');
    return user;
  }

  async findByIds(ids: any): Promise<User[]> {
    return this.userModel.find({ _id: { $in: ids } }).exec();
  }
}
