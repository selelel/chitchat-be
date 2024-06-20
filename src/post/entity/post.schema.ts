import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Audience } from '../interfaces/post.audience.enums';

export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: true })
@ObjectType()
export class Post {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  @Field(() => String)
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @Field(() => String)
  author: mongoose.Schema.Types.ObjectId;

  @Prop({ type: [String] })
  @Field(() => [String])
  tags: string[];

  @Prop({ type: String, required: true })
  @Field(() => String)
  content: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }] })
  @Field(() => [String])
  comments: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  @Field(() => [String])
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
