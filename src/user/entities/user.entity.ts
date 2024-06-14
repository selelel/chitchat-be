import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { PersonalObjectEntity } from './personal.object.entity';
import { AccountObjectEntity } from './account.object.entity';
import { Chat } from 'src/chat/entities/chat.entity';
import {
  defaultRequestObjectDto,
  RequestObjectDto,
} from './request.object.dto';

export type UserDoc = User & Document;

@Schema()
@ObjectType()
export class User {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  @Field(() => String)
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ type: PersonalObjectEntity, required: true })
  @Field(() => PersonalObjectEntity)
  user: PersonalObjectEntity;

  @Prop({ type: AccountObjectEntity })
  @Field(() => AccountObjectEntity)
  userInfo: AccountObjectEntity;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, required: true })
  @Field()
  email: string;

  @Prop({ type: [String] })
  @Field(() => [String])
  tags: string[];

  @Prop({ type: Boolean, default: false })
  @Field()
  isActive: boolean;

  @Prop({ type: RequestObjectDto, default: defaultRequestObjectDto })
  @Field(() => RequestObjectDto)
  requests: RequestObjectDto;

  @Prop({ type: Boolean, default: false })
  @Field(() => Boolean)
  isPrivate: boolean;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }] })
  @Field(() => [Chat])
  chats: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  @Field(() => [User])
  followers: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  @Field(() => [User])
  following: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: [String] })
  token: string[];

  // * Feature prototype not started yet.
  @Prop({ type: [String] })
  @Field(() => [String])
  group: string[];

  @Prop({ type: [String] })
  @Field(() => [String])
  posts: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
