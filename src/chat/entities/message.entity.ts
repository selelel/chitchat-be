import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Chat } from './chat.entity';
import { User } from 'src/user/entities/user.entity';
import { MessageContentObject } from '../interfaces/message.content_object';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true })
@ObjectType()
export class Message {
  @Prop({ type: mongoose.Schema.ObjectId, auto: true })
  @Field(() => ID)
  _id: mongoose.Schema.Types.ObjectId;

  @Field(() => Date)
  createdAt: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' })
  @Field(() => User)
  chatId: Chat;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @Field(() => User)
  userId: User;

  @Prop({ type: MessageContentObject, required: true })
  @Field(() => MessageContentObject)
  content: MessageContentObject;

  @Prop({ type: Date })
  @Field(() => Date)
  editedAt?: Date;

  @Prop({ type: Boolean })
  @Field()
  seen: boolean;

  @Prop({ type: String })
  @Field(() => String)
  reaction?: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
