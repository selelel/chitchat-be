import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './entity/post.schema';
import { Model } from 'mongoose';
import { ConflictError } from 'src/core/error/global.error';
import { UserService } from 'src/user/user.service';
import { Comments, CommentsDocument } from './entity/comments.schema';
import { Audience } from './interfaces/post.audience.enums';
import { Pagination } from 'src/utils/global_dto/pagination.dto';
import { User, UserDocument } from 'src/user/entities/user.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Comments.name) private commentModel: Model<CommentsDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private usersService: UserService,
  ) {}

  // TODO implement [TAGS, MBTI, AND OTHER] when getting post recommendations (future features)

  async getUserFollowingPost(userId: string, pagination: Pagination) {
    this.usersService.isUserExisted(userId);

    const { following } = (
      await this.userModel.findOne({ _id: userId })
    ).populated('following');

    return await this.postModel
      .find({
        author: { $in: following },
        audience: {
          $in: [Audience.FRIENDS, Audience.PUBLIC, Audience.PRIVATE],
        },
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      })
      .skip(pagination.skip || 5)
      .limit(pagination.limit || 5)
      .populate('comments')
      .exec();
  }

  async getRecommendations(userId: string, pagination: Pagination) {
    this.usersService.isUserExisted(userId);

    const { following } = await this.userModel.findOne({ _id: userId });

    const posts = (await this.postModel
      .find({
        author: { $nin: following },
        audience: Audience.PUBLIC,
      })
      .skip(pagination.skip || 5)
      .limit(pagination.limit || 5)
      .populate('author')
      .exec()) as any[];

    // ! Type brute force (I'm sorry)
    const filteredPosts = posts.filter((post) => !post.author?.isPrivate);

    return filteredPosts;
  }

  async createPost(userId: string, content: string) {
    await this.usersService.isUserExisted(userId);
    const user = await this.userModel.findOne({ _id: userId });

    const post = await this.postModel.create({ content });
    user.updateOne({
      $push: {
        posts: post._id,
      },
    });

    return post;
  }

  async updatePost(postId: string, content: string) {
    const post = await this.postModel.create({ content });
    await this.isPostExisted(postId);
    post.updateOne({
      content,
      updatedAt: Date.now(),
    });

    return post;
  }

  async addPostComments(postId: string, userId: string, content: string) {
    try {
      const post = await this.postModel.findOne({ _id: postId });

      if (!post) {
        throw new ConflictError('Post not Found!');
      }

      const { _id } = await this.commentModel.create({ content, user: userId });
      await this.postModel.findByIdAndUpdate(postId, {
        $push: { comments: _id },
      });

      return post;
    } catch (error) {
      return error;
    }
  }

  async removePostComments(postId: string, commentId: string) {
    try {
      const post = await this.postModel.findOne({ _id: postId });

      if (!post) {
        throw new ConflictError('Post not Found!');
      }

      await this.postModel.deleteOne({ _id: commentId });

      await post.updateOne({ _id: postId, $pull: { comments: commentId } });

      return post;
    } catch (error) {
      return error;
    }
  }

  async editPostComments(commentId: string, content: string) {
    try {
      const comment = await this.postModel.findOne({ _id: commentId });

      if (!comment) {
        throw new ConflictError('comment not Found!');
      }

      await comment.updateOne({
        _id: commentId,
        content,
        updatedAt: Date.now(),
      });

      return comment;
    } catch (error) {
      return error;
    }
  }

  private async isPostExisted(postId: string): Promise<PostDocument> {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new ConflictError('Post not Found!');
    }
    return post;
  }
}