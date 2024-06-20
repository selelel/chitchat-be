import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './entity/post.schema';
import { User, UserSchema } from 'src/user/entities/user.entity';
import { Comment, CommentSchema } from './entity/comments.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [PostService],
})
export class PostModule {}
