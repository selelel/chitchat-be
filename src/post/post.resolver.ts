import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Post } from './entity/post.schema';
import { PostService } from './post.service';
import { UseGuards } from '@nestjs/common/decorators';
import { GqlCurrentUser } from 'src/auth/decorator/gql.current.user';
import { GqlAuthGuard } from 'src/auth/guards/gql.auth.guard';
import { PostOptionInput } from './dto/post.option_input';
import { PostContentInput } from './dto/post.content_input.dto';
import { User } from 'src/user/entities/user.entity';
import { CommentContentInput } from './dto/comment.content_input';
import { Comments } from './entity/comments.schema';
import { Pagination } from 'src/utils/global_dto/pagination.dto';
import { GetCurrentUser } from 'src/auth/interfaces/jwt_type';
import mongoose from 'mongoose';

@Resolver(() => Post)
export class PostResolver {
  constructor(private readonly postService: PostService) {
    console.log('Invoked!');
  }

  @Mutation(() => Post)
  async getPost(@Args('postId') postId: string): Promise<Post> {
    try {
      const post = await this.postService.getPostById(
        postId as unknown as mongoose.Schema.Types.ObjectId,
      );
      return post;
    } catch (error) {
      return error;
    }
  }

  @Mutation(() => [Post])
  @UseGuards(GqlAuthGuard)
  async getUserFollowingPosts(
    @Args('pagination') pagination: Pagination,
    @GqlCurrentUser() { user },
  ): Promise<Post[]> {
    const { payload } = user;
    const posts = await this.postService.getUserFollowingPost(
      payload._id,
      pagination,
    );
    return posts;
  }

  @Mutation(() => [Post])
  @UseGuards(GqlAuthGuard)
  async getRecommendedPosts(
    @Args('pagination') pagination: Pagination,
    @GqlCurrentUser() { user },
  ): Promise<Post[]> {
    const { payload } = user;
    const posts = await this.postService.getRecommendations(
      payload._id,
      pagination,
    );
    return posts;
  }

  @Mutation(() => Post)
  @UseGuards(GqlAuthGuard)
  async createNewPost(
    @GqlCurrentUser() { decoded_token }: GetCurrentUser,
    @Args('postContent') content: PostContentInput,
    @Args('postOption') option: PostOptionInput,
  ): Promise<Post> {
    const { payload } = decoded_token;
    const newPost = await this.postService.createPost(
      payload._id,
      content,
      option,
    );

    return newPost;
  }

  @Mutation(() => Post)
  @UseGuards(GqlAuthGuard)
  async updatePost(
    @Args('postId') postId: string,
    @Args('updatedPost') updatedPost: PostContentInput,
    @Args('postOption') option: PostOptionInput,
    @GqlCurrentUser() { user },
  ): Promise<Post> {
    try {
      const updatedUser = await this.postService.updatePost(
        postId as unknown as mongoose.Schema.Types.ObjectId,
        user.payload._id,
        option,
      );
      return updatedUser;
    } catch (error) {
      return error;
    }
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async removePost(
    @Args('postId') postId: string,
    @GqlCurrentUser()
    {
      user: {
        payload: { _id },
      },
    },
  ): Promise<any> {
    try {
      const user = await this.postService.removePost(
        postId as unknown as mongoose.Schema.Types.ObjectId,
        _id,
      );
      return user;
    } catch (error) {
      return error;
    }
  }

  @Mutation(() => Comments)
  @UseGuards(GqlAuthGuard)
  async addCommentToPost(
    @Args('postId') postId: string,
    @Args('commentContent') commentContent: CommentContentInput,
    @GqlCurrentUser()
    {
      user: {
        payload: { _id },
      },
    },
  ): Promise<Comments> {
    try {
      const comment = await this.postService.addPostComments(
        _id,
        postId as unknown as mongoose.Schema.Types.ObjectId,
        commentContent,
      );
      return comment;
    } catch (error) {
      return error;
    }
  }

  @Mutation(() => Comments)
  @UseGuards(GqlAuthGuard)
  async editPostComment(
    @Args('commentId') commentId: string,
    @Args('updatedComment') updatedComment: CommentContentInput,
  ): Promise<Comments> {
    try {
      const editedComment = await this.postService.editPostComments(
        commentId,
        updatedComment,
      );
      return editedComment;
    } catch (error) {
      return error;
    }
  }

  @Mutation(() => Post)
  @UseGuards(GqlAuthGuard)
  async removePostComment(@Args('commentId') commentId: string): Promise<Post> {
    try {
      const post = await this.postService.removePostComments(commentId);
      return post;
    } catch (error) {
      return error;
    }
  }
}
