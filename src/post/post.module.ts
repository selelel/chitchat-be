import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './entity/post.schema';
import { User, UserSchema } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Comments, CommentsSchema } from './entity/comments.schema';
import { PostResolver } from './post.resolver';
import { AuthService } from 'src/auth/auth.service';
import { PostController } from './post.controller';
import { FileUploadService } from 'src/utils/utils_modules/services/file_upload.service';
import { BucketsService } from 'src/utils/utils_modules/third_party/buckets.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Comments.name, schema: CommentsSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [
    PostService,
    UserService,
    PostResolver,
    AuthService,
    FileUploadService,
    BucketsService,
  ],
  controllers: [PostController],
})
export class PostModule {}
