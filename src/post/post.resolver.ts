import { Resolver } from '@nestjs/graphql';
import { Post } from './entity/post.schema';

@Resolver(() => Post)
export class PostResolver {
  constructor() {}

  // @Query(() => [Post])
  // async forYouPage(): Promise<Post> {}
}
