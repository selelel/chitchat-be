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

@Resolver(() => Post)
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @Mutation(() => [Post])
  @UseGuards(GqlAuthGuard)
  async getPostsFromFollowedUsers(
    @Args('paginate') paginate: Pagination,
    @GqlCurrentUser() { user },
  ): Promise<Post[]> {
    const { payload } = user;
    const post = await this.postService.getUserFollowingPost(
      payload._id,
      paginate,
    );
    return post;
  }

  @Mutation(() => [Post])
  @UseGuards(GqlAuthGuard)
  async getRecommendedPosts(
    @Args('paginate') paginate: Pagination,
    @GqlCurrentUser() { user },
  ): Promise<Post[]> {
    const { payload } = user;
    const post = await this.postService.getRecommendations(
      payload._id,
      paginate,
    );
    return post;
  }

  @Mutation(() => Post)
  @UseGuards(GqlAuthGuard)
  async createPost(
    @Args('postContent') content: PostContentInput,
    @Args('postOption') option: PostOptionInput,
    @GqlCurrentUser() { user },
  ): Promise<Post> {
    const { payload } = user;
    const post = await this.postService.createPost(
      payload._id,
      content,
      option,
    );
    return post;
  }

  @Mutation(() => Post)
  @UseGuards(GqlAuthGuard)
  async updatePost(
    @Args('postId') postId: string,
    @Args('postContent') content: PostContentInput,
    @Args('postOption') option: PostOptionInput,
  ): Promise<Post> {
    const post = await this.postService.updatePost(postId, content, option);
    console.log(post);
    return post;
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
      const user = await this.postService.removePost(postId, _id);
      return user;
    } catch (error) {
      return error;
    }
  }

  @Mutation(() => Comments)
  @UseGuards(GqlAuthGuard)
  async commentOnPost(
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
        postId,
        commentContent,
      );
      return comment;
    } catch (error) {
      return error;
    }
  }

  @Mutation(() => Comments)
  @UseGuards(GqlAuthGuard)
  async editCommentOnPost(
    @Args('commentId') commentId: string,
    @Args('commentContent') commentContent: CommentContentInput,
  ): Promise<Comments> {
    try {
      const comment = await this.postService.editPostComments(
        commentId,
        commentContent,
      );
      return comment;
    } catch (error) {
      return error;
    }
  }

  @Mutation(() => Post)
  @UseGuards(GqlAuthGuard)
  async removeCommentOnPost(
    @Args('commentId') commentId: string,
  ): Promise<Post> {
    try {
      const post = await this.postService.removePostComments(commentId);
      return post;
    } catch (error) {
      return error;
    }
  }
}
