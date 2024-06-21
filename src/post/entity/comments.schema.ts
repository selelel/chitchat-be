import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type CommentsDocument = HydratedDocument<Comments>;

@Schema({ timestamps: true })
@ObjectType()
export class Comments {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  @Field(() => String)
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  @Field(() => String)
  user: mongoose.Schema.Types.ObjectId;

  @Prop({ type: String, required: true })
  @Field(() => String)
  reaction: mongoose.Schema.Types.ObjectId;

  @Prop({ type: String, required: true })
  @Field(() => String)
  content: string;

  @Field(() => Date)
  updatedAt: Date;
}

export const CommentsSchema = SchemaFactory.createForClass(Comments);
