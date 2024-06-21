import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './entity/post.schema';
import { Model } from 'mongoose';
import { ConflictError } from 'src/core/error/global.error';
import { User, UserDocument } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Comments, CommentsDocument } from './entity/comments.schema';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Comments.name) private commentModel: Model<CommentsDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private usersService: UserService,
  ) {}

  async createPost(userId: string, content: string) {
    await this.usersService.foundUser(userId);
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
    await this.foundPost(postId);
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

  async foundPost(postId: string) {
    const post = await this.postModel.create({ _id: postId });
    if (!post) throw new ConflictError('Post not Found!');
  }
}
