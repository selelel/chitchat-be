import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './entity/post.schema';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './entity/comments.schema';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}
  // Todo figure out the post feeds and how the FYP will behave
}
