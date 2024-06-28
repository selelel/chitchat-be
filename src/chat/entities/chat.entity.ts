import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Message } from './message.entity';
import { User } from 'src/user/entities/user.entity';

export type ChatDocument = HydratedDocument<Chat>;

@Schema()
@ObjectType()
export class Chat {
  @Prop({ type: mongoose.Schema.ObjectId, auto: true })
  @Field(() => ID)
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ type: [{ type: mongoose.Schema.ObjectId, ref: 'User' }] })
  @Field(() => [User])
  usersId: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: [{ type: mongoose.Schema.ObjectId, ref: 'Message' }] })
  @Field(() => [Message])
  messages: Message[];

  @Prop({ type: String })
  @Field(() => String)
  title?: string;

  @Prop({ type: Boolean })
  @Field(() => Boolean)
  isMuted?: string | null;

  @Prop({ type: String })
  @Field(() => String)
  avatar?: string | null;

  // TODO [USER_BLOCKED, RESTRICTED]
  // @Prop({ type: [USER_BLOCKED, RESTRICTED] })
  // @Field(() => [USER_BLOCKED, RESTRICTED])
  // status?: [USER_BLOCKED, RESTRICTED];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
