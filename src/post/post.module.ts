import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './entity/post.schema';
import { User, UserSchema } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Comments, CommentsSchema } from './entity/comments.schema';
import { PostResolver } from './post.resolver';
import { AuthService } from 'src/auth/auth.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Comments.name, schema: CommentsSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [PostService, UserService, PostResolver, AuthService],
})
export class PostModule {}
