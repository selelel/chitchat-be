import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Messages } from './chat.message.entity';
import { User } from 'src/user/entities';
import mongoose, { HydratedDocument } from 'mongoose';
import { Field, ObjectType } from '@nestjs/graphql';

export type ChatDocument = HydratedDocument<Chat>;

@Schema()
@ObjectType()
export class Chat {
  @Prop({ type: [{ type: mongoose.Schema.ObjectId, ref: 'User' }] })
  @Field(() => [User])
  usersId: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: String })
  @Field(() => String)
  title: string;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
