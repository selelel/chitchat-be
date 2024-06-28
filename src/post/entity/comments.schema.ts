import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { CommentContentObject } from '../interfaces/comment.content_object';
import { Post } from './post.schema';

export type CommentsDocument = HydratedDocument<Comments>;

@Schema({ timestamps: true })
@ObjectType()
export class Comments {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  @Field(() => String)
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true })
  @Field(() => Post)
  postId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  @Field(() => String)
  user: mongoose.Schema.Types.ObjectId;

  @Prop({ type: String })
  @Field(() => String)
  reaction: mongoose.Schema.Types.ObjectId;

  @Prop({ type: CommentContentObject, required: true })
  @Field(() => CommentContentObject)
  content: CommentContentObject;

  @Prop({ type: Date })
  @Field(() => Date)
  updatedAt: Date;
}

export const CommentsSchema = SchemaFactory.createForClass(Comments);
