import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Audience } from '../interfaces/post.audience.enums';
import { Comments } from './comments.schema';
import { User } from 'src/user/entities/user.entity';
import { PostContentObject } from '../interfaces/post.content_object';

export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: true })
@ObjectType()
export class Post {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  @Field(() => String)
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post' })
  shared_post_ref: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @Field(() => User)
  author: mongoose.Schema.Types.ObjectId;

  @Prop({ type: [String] })
  @Field(() => [String])
  tags: string[];

  @Prop({ type: PostContentObject, required: true })
  @Field(() => PostContentObject)
  content: PostContentObject;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comments' }] })
  @Field(() => [Comments])
  comments: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  @Field(() => [User])
  likes: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: Number, default: 0 })
  @Field(() => Number)
  shares: number;

  @Prop({
    type: String,
    enum: Audience,
    default: Audience.PUBLIC,
  })
  @Field(() => Audience)
  audience: Audience;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
