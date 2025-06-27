import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './entity/post.schema';
import mongoose, { Model } from 'mongoose';
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

  async getUserLikedPosts(userId: mongoose.Schema.Types.ObjectId): Promise<Post[]> {
    try {
      const posts = await this.postModel.find({
        $or: [
          { likes: userId }
        ],
        deleted: { $ne: true }
      })
      .sort({ createdAt: -1 })
      .populate('author');

      return posts;
    } catch (error) {
      return error;
    }
  }

  async getUserPosts(userId: mongoose.Schema.Types.ObjectId): Promise<Post[]> {
    try {
      const posts = await this.postModel.find({
        $or: [
          { author: userId }
        ],
        deleted: { $ne: false }
      })
      .sort({ createdAt: -1 })
      .populate('author');

      return posts;
    } catch (error) {
      return error;
    }
  }


  async getPostById(postId: mongoose.Schema.Types.ObjectId): Promise<Post> {
    try {
      const post = await this.postModel
      .findById(postId)
      .populate('author');
      return post;
    } catch (error) {
      return error;
    }
  }

  async userLikePost(postId: mongoose.Schema.Types.ObjectId, userId: mongoose.Schema.Types.ObjectId): Promise<void> {
    try {
      const post = await this.postModel.findById(postId);
      if (!post) {
        throw new ConflictError('Post not Found!');
      }

      if (post.likes.includes(userId)) {
        throw new ConflictError('User already liked the post!');
      }

      post.likes.push(userId);

      await this.postModel.findByIdAndUpdate(postId, {
        $push: { likes: userId },
      });
    } catch (error) {
      throw error;
    }
  }

  async userSavePost(postId: mongoose.Schema.Types.ObjectId, userId: mongoose.Schema.Types.ObjectId): Promise<void> {
    try {
      const post = await this.postModel.findById(postId);
      if (!post) {
        throw new ConflictError('Post not Found!');
      }

      if (post.save.includes(userId)) {
        throw new ConflictError('User already save the post!');
      }

      post.save.push(userId);

      await this.postModel.findByIdAndUpdate(postId, {
        $push: { save: userId },
      });
    } catch (error) {
      throw error;
    }
  }

  async userUnlikePost(postId: mongoose.Schema.Types.ObjectId, userId: mongoose.Schema.Types.ObjectId): Promise<void> {
    try {
      const post = await this.postModel.findById(postId);
      if (!post) {
        throw new ConflictError('Post not Found!');
      }

      if (!post.likes.includes(userId)) {
        throw new ConflictError('User has not liked the post!');
      }

      await this.postModel.findByIdAndUpdate(postId, {
        $pull: { likes: userId },
      });
      
    } catch (error) {
      throw error;
    }
  }

  async getUserFollowingPost(
    userId: mongoose.Schema.Types.ObjectId,
    pagination: Pagination,
  ): Promise<Post[]> {
    this.usersService.isUserExisted(userId);

    const { following } = await this.userModel.findOne({ _id: userId });

    this.usersService.isUserExisted(userId);

    const posts = (await this.postModel
      .find({
        audience: [Audience.FRIENDS, Audience.PUBLIC],
        author: { $in: following },
        deleted: { $ne: false }
      })
      .populate('author')
      .skip(pagination.skip || 0)
      .sort({ createdAt: -1 })
      .limit(pagination.limit || 5)
      .exec()) as any[];
      
      return posts;
  }

  async getRecommendations(
    userId: mongoose.Schema.Types.ObjectId,
    pagination: Pagination,
  ): Promise<Post[]> {
    this.usersService.isUserExisted(userId);

    const posts = (await this.postModel
      .find({
        audience: Audience.PUBLIC,
        author: { $ne: userId },
        deleted: { $ne: false }
      })
      .populate('author')
      .sort({ createdAt: -1 })
      .skip(pagination.skip || 0)
      .limit(pagination.limit || 5)
      .exec()) as any[];

    return posts;
  }

  async createPost(
    userId: mongoose.Schema.Types.ObjectId,
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
    postId: mongoose.Schema.Types.ObjectId,
    content?: Partial<PostContentObject>,
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

  async removePost(
    postId: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
  ): Promise<User> {
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

  async deleteArchivedPost(
    postId: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
  ): Promise<User> {
    try {
      await this.doesPostExist(postId);
      await this.usersService.isUserExisted(userId);

      const post = await this.postModel.findById(postId);

      if (!!post.deleted) {
        // If already archived, permanently delete
        if (post.content.images) {
          await this.fileUploadService.removeFileImage(post.content.images);
        }
        await this.commentModel.deleteMany({ postId: post._id });
        await this.postModel.findByIdAndDelete(postId);
      } else {
        // If not archived, just set deleted: true (archive)
        await post.updateOne({ $set: { deleted: true } });
      }

      // Remove post reference from user
      const user = await this.userModel.findByIdAndUpdate(
        userId,
        { $pull: { posts: postId } },
        { new: true }
      );

      return user;
    } catch (error) {
      throw error;
    }
  }

  async addPostComments(
    userId: mongoose.Schema.Types.ObjectId,
    postId: mongoose.Schema.Types.ObjectId,
    content: CommentContentObject,
  ): Promise<Comments> {
    try {
      await this.doesPostExist(postId);
      await this.usersService.isUserExisted(userId);

      const comment = await this.commentModel.create({
        content,
        createdAt: Date.now(),
        user: userId,
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
        { 
          new: true, 
          timestamps: false
        },
        
      );

      return post;
    } catch (error) {
      return false;
    }
  }

  private async doesPostExist(
    postId: mongoose.Schema.Types.ObjectId,
  ): Promise<PostDocument> {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new ConflictError('Post not Found!');
    }
    return post;
  }

  async isUserAuthor(postId: string, userId: string): Promise<PostDocument> {
    const post = await this.postModel.findOne({ _id: postId, author: userId });

    if (!post) {
      throw new Error('User is not the author of the post!');
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
