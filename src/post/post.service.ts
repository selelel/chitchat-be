import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './entity/post.schema';
import { Model } from 'mongoose';
import { ConflictError } from 'src/utils/error/global.error';
import { UserService } from 'src/user/user.service';
import { Comments, CommentsDocument } from './entity/comments.schema';
import { Audience } from './interfaces/post.audience.enums';
import { Pagination } from 'src/utils/global_dto/pagination.dto';
import { User, UserDocument } from 'src/user/entities/user.entity';
import { PostContentObject } from './interfaces/post.content_object';
import { CommentContentObject } from './interfaces/comment.content_object';
import { ObjectId } from 'mongodb';
import { PostOptionInput } from './dto/post.option_input';
import { FileUploadService } from 'src/utils/utils_modules/services/file_upload.service';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Comments.name) private commentModel: Model<CommentsDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly usersService: UserService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async getUserFollowingPost(
    userId: string,
    pagination: Pagination,
  ): Promise<Post[]> {
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
      .limit(pagination.limit || 5)
      .populate('comments')
      .exec();
  }

  async getRecommendations(
    userId: string,
    pagination: Pagination,
  ): Promise<Post[]> {
    this.usersService.isUserExisted(userId);

    const user = await this.userModel.findOne({ _id: userId });

    const posts = (await this.postModel
      .find({
        author: { $nin: [...user.following, user._id] },
        audience: Audience.PUBLIC,
      })
      .skip(pagination.skip || 0)
      .limit(pagination.limit || 5)
      .exec()) as any[];

    const filteredPosts = posts.filter((post) => !post.author?.isPrivate);

    return filteredPosts;
  }

  async createPost(
    userId: string,
    content: PostContentObject,
    option?: PostOptionInput,
  ): Promise<Post> {
    await this.usersService.isUserExisted(userId);
    const post = await this.postModel.create({
      content,
      author: userId,
      audience: option?.audience || Audience.PUBLIC,
      tags: option?.tags?.map((d) => new ObjectId(d)) || [],
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

    return post.populate(['author', 'tags']);
  }

  async updatePost(
    postId: string,
    content: Partial<PostContentObject>,
    option?: PostOptionInput,
  ): Promise<Post> {
    const { content: prevContent, audience: prevAudience } =
      await this.doesPostExist(postId);

    const updatedPost = await this.postModel
      .findByIdAndUpdate(
        postId,
        {
          $set: {
            content: { ...prevContent, ...content },
            audience: option?.audience || prevAudience,
            updatedAt: Date.now(),
          },
          $addToSet: {
            tags: option?.tags || [],
          },
        },
        { new: true },
      )
      .populate(['author', 'tags']);

    return updatedPost;
  }

  async removePost(postId: string, userId: string): Promise<User> {
    try {
      await this.doesPostExist(postId);
      await this.usersService.isUserExisted(userId);

      const post = await this.postModel.findByIdAndDelete(postId);

      if (post.content.images) {
        await this.fileUploadService.removeFileImage(post.content?.images);
      }

      const user = await this.userModel.findByIdAndUpdate(
        userId,
        {
          $pull: { posts: postId },
        },
        { new: true },
      );

      await this.commentModel.deleteMany({ postId: post._id });
      return user;
    } catch (error) {
      return error;
    }
  }

  async addPostComments(
    userId: string,
    postId: string,
    content: CommentContentObject,
  ): Promise<Comments> {
    try {
      await this.doesPostExist(postId);
      await this.usersService.isUserExisted(userId);

      const comment = await this.commentModel.create({
        content,
        createdAt: Date.now(),
        user: new ObjectId(userId),
        postId: postId,
      });

      await this.postModel.findByIdAndUpdate(
        postId,
        {
          $push: { comments: comment._id },
        },
        { new: true },
      );

      return comment;
    } catch (error) {
      return error;
    }
  }

  async removePostComments(commentId: string): Promise<Post> {
    try {
      const { postId } = await this.doesCommentExist(commentId);
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

  async editPostComments(
    commentId: string,
    content: CommentContentObject,
  ): Promise<Comments> {
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

  async appendImageOnPost(
    postId: string,
    buffers: Buffer[],
  ): Promise<Post | boolean> {
    try {
      const images = await this.fileUploadService.uploadFileImagePost(
        buffers,
        postId,
        'png',
      );

      if (!images) {
        throw new ConflictError('Error processing image');
      }

      const post = await this.postModel.findByIdAndUpdate(
        postId,
        {
          'content.images': images,
        },
        { new: true },
      );

      return post;
    } catch (error) {
      return false;
    }
  }

  private async doesPostExist(postId: any): Promise<PostDocument> {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new ConflictError('Post not Found!');
    }
    return post;
  }

  async isUserAuthor(postId: string, userId: string): Promise<PostDocument> {
    const post = await this.postModel.findOne({ _id: postId, author: userId });

    if (!post) {
      throw new ConflictException('User is not the author of the post!');
    }

    return post;
  }

  private async doesCommentExist(commentId: string): Promise<CommentsDocument> {
    const comment = await this.commentModel.findOne({ _id: commentId });

    if (!comment) {
      throw new ConflictError('Comment not Found!');
    }
    return comment;
  }
}
