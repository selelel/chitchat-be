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
import { PostContentObject } from './interfaces/post.content_object';
import { CommentContentObject } from './interfaces/comment.content_object';
import { ObjectId } from 'mongodb';

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

    const { following } = await this.userModel.findOne({ _id: userId });

    return await this.postModel
      .find({
        author: { $in: following },
        audience: {
          $in: [Audience.FRIENDS, Audience.PUBLIC],
        },
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      })
      .skip(pagination.skip || 0)
      .limit(pagination.limit || 0)
      .populate('comments')
      .exec();
  }

  async getRecommendations(userId: string, pagination: Pagination) {
    this.usersService.isUserExisted(userId);

    const user = await this.userModel.findOne({ _id: userId });

    const posts = (await this.postModel
      .find({
        author: { $nin: [...user.following, user._id] },
        audience: Audience.PUBLIC,
      })
      .skip(pagination.skip || 0)
      .limit(pagination.limit)
      .exec()) as any[];

    const filteredPosts = posts.filter((post) => !post.author?.isPrivate);

    return filteredPosts;
  }

  // TODO options
  async createPost(userId: string, content: PostContentObject, option?: any) {
    await this.usersService.isUserExisted(userId);
    const post = await this.postModel.create({
      content,
      author: userId,
      audience: option?.audience || Audience.PUBLIC,
    });

    await this.userModel.findByIdAndUpdate(
      userId,
      {
        $push: {
          posts: post._id,
        },
      },
      { new: true },
    );

    return post.populate('author');
  }

  async updatePost(postId: string, content: Partial<PostContentObject>) {
    const post = await this.doesPostExist(postId);
    const updatedPost = await this.postModel.findByIdAndUpdate(
      postId,
      {
        $set: {
          content: { ...post.content, ...content },
          updatedAt: Date.now(),
        },
      },
      { new: true },
    );

    return updatedPost;
  }

  async addPostComments(
    userId: string,
    postId: string,
    content: CommentContentObject,
  ) {
    try {
      await this.doesPostExist(postId);
      await this.usersService.isUserExisted(userId);

      const comment = await this.commentModel.create({
        content,
        createdAt: Date.now(),
        user: new ObjectId(userId),
      });

      const post = await this.postModel.findByIdAndUpdate(
        postId,
        {
          $push: { comments: comment._id },
        },
        { new: true },
      );

      return post.populate('comments');
    } catch (error) {
      return error;
    }
  }

  async removePostComments(postId: string, commentId: string) {
    try {
      await this.doesPostExist(postId);
      const post = await this.postModel.findByIdAndUpdate(
        postId,
        {
          $pull: { comments: commentId },
        },
        { new: true },
      );

      await this.commentModel.deleteOne({ _id: commentId });

      return post;
    } catch (error) {
      return error;
    }
  }

  async editPostComments(commentId: string, content: CommentContentObject) {
    try {
      const comment = await this.doesCommentExist(commentId);

      const updatedComment = await this.commentModel.findByIdAndUpdate(
        commentId,
        {
          $set: {
            content: { ...comment.content, ...content },
            updatedAt: Date.now(),
          },
        },
        { new: true },
      );

      return updatedComment;
    } catch (error) {
      return error;
    }
  }

  private async doesPostExist(postId: string): Promise<PostDocument> {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new ConflictError('Post not Found!');
    }
    return post;
  }

  private async doesCommentExist(commentId: string): Promise<CommentsDocument> {
    const comment = await this.commentModel.findOne({ _id: commentId });

    if (!comment) {
      throw new ConflictError('comment not Found!');
    }
    return comment;
  }
}
