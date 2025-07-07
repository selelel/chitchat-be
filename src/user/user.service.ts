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
import { UserProfile } from 'src/auth/dto/google_payload.dto';

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
    _id: string,
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
        { $addToSet: { 'requests.toFollowers': new ObjectId(_id) } },
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
//! user toFollowing hasn't deleted the userId.
  async removesUserRequest(
    userId: string,
    targetUserId: string,
  ): Promise<User> {
    try {
      const userToRemove = await this.userModel.findByIdAndUpdate(
        new ObjectId(targetUserId),
        { $pull: { 'requests.toFollowings': new ObjectId(userId) } },
        { new: true },
      );
      
      // Remove from userId's toFollowers (incoming request)
      const userToAccepts = await this.userModel.findByIdAndUpdate(
        userId,
        { $pull: { 'requests.toFollowers': new ObjectId(targetUserId) } },
        { new: true },
      );

      if (!userToAccepts || !userToRemove) {
        throw new ConflictError('Failed to remove request from one or both users');
      }

      return await this.userModel
        .findOne({ _id: userId })
        .populate('requests.toFollowers')
        .populate('requests.toFollowings');
    } catch (error) {
      console.error('Error in removesUserRequest:', error);
      throw error; // Re-throw the error instead of returning it
    }
  }

  async acceptsUserRequestToFollow(
    userId: string,
    targetUserId: string,
  ): Promise<User> {
    try {
      // Check if the current user has an incoming request from targetUserId
      if (!(await this.isUserToAccept(userId, targetUserId)))
        throw new UnauthorizedError("User can't accept to following");

      // Remove the request first
      await this.removesUserRequest(userId, targetUserId);

      // Verify the request was removed
      const requestStillExists = await this.isUserToAccept(userId, targetUserId);
      if (requestStillExists) {
        throw new ConflictError('Failed to remove the follow request');
      }

      // Add to followers/following
      const userUpdate = await this.userModel.findByIdAndUpdate(
        userId,
        { $addToSet: { followers: targetUserId } },
        { new: true },
      );

      const targetUpdate = await this.userModel.findByIdAndUpdate(
        targetUserId,
        { $addToSet: { following: userId } },
        { new: true },
      );

      if (!userUpdate || !targetUpdate) {
        throw new ConflictError('Failed to establish follow relationship');
      }

      return await this.userModel
        .findOne({ _id: userId })
        .populate('followers')
        .populate('requests.toFollowers')
        .populate('requests.toFollowings');
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
        .populate('followers')
        .populate('requests.toFollowers')
        .populate('requests.toFollowings');
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
  // TODO: Make the request objext populateable
  async findById(_id?: mongoose.Schema.Types.ObjectId) {
    const user = await this.userModel.findById(_id)
    .populate('posts.author')
    .populate('requests')
    .populate({
      path: 'requests.toFollowers',
      select: 'user userInfo email',
    })
    .populate('requests.toFollowings')
    .populate('followers')
    .populate('following');
    return user;
  }


  async getFriendSuggestion(
    userId: string,
    { limit = 10, skip = 0 }: { limit?: number; skip?: number }
  ): Promise<User[]> {
  
    // Step 1: Fetch current user with their followings
    const currentUser = await this.userModel
      .findById(userId)
      .populate('following')
      .exec();
  
    if (!currentUser) return [];
  
    // Collect following IDs as strings
    const followingIds = (currentUser.following as unknown as User[]).map((d) =>
      d._id.toString()
    );
    followingIds.push(userId); // Exclude self
  
    // Step 2: Find public users excluding followings and self
    const suggestedUsers = await this.userModel
      .find({
        _id: { $nin: followingIds },
        isPrivate: false
      })
      .populate('followers')
      .skip(skip)
      .limit(limit)
      .exec();
  
    return suggestedUsers;
  }
  
  async findManyById(_ids: string[]) {
    const users = await this.userModel.find({ _id: { $in: _ids } })
      .populate('posts.author')
      .populate('requests')
      .populate('requests.toFollowings')
      .populate('followers')
      .populate('following');

    return users;
  }


  async findAll(): Promise<User[]> {
    const allUser = await this.userModel.find().exec();
    return allUser;
  }

  async findOneById(_id: string): Promise<User> {
    try {
      return await this.userModel
        .findOne({ _id })
        .populate('posts.author')
        .populate('requests.toFollowers')
        .populate('requests.toFollowings')
        .populate('followers')
        .populate('following')
        .exec();
    } catch (error) {
      return error;
    }
  }
  async findByUsername(username: string): Promise<User> {
    try {
      return await this.userModel
        .findOne({ 'user.username': username })
        .populate('followers')
        .populate('following')
        .exec();
    } catch (error) {
      return error;
    }
  }


  async findEmail(email: string): Promise<User> {
    return await this.userModel.findOne({ email }).exec();
  }

  async isUserToAccept(
    _id: string,
    targetUserId: string,
  ) {
    try {
      
      const user = await this.userModel.findOne({
        _id,
        'requests.toFollowers': { $in: [new ObjectId(targetUserId)] },
      });
      
      if (!user) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in isUserToAccept:', error);
      return false;
    }
  }

  async isUserAlreadyFollowed(
    _id: string,
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

  async findByIdsWithRequests(ids: mongoose.Schema.Types.ObjectId[]): Promise<User[]> {
    return this.userModel.find({ _id: { $in: ids } })
      .populate('posts.author')
      .populate('requests')
      .populate({
        path: 'requests.toFollowers',
        select: 'user userInfo email',
      })
      .populate('requests.toFollowings')
      .populate('followers')
      .populate('following')
      .exec();
  }
}
