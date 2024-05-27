import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { PersonalObjectEntity } from './personal.object.entity';
import { AccountObjectEntity } from './account.object.entity';
import { Chat } from 'src/chat/entities/chat.entity';

export type UserDocument = HydratedDocument<User>;

@Schema()
@ObjectType()
export class User {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  @Field(() => String)
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ type: PersonalObjectEntity, required: true })
  @Field(() => PersonalObjectEntity)
  user: PersonalObjectEntity;

  @Prop({ type: AccountObjectEntity, required: true })
  @Field(() => AccountObjectEntity)
  userInfo: AccountObjectEntity;

  @Prop({ type: String, required: true })
  public password: string;

  @Prop({ type: String, required: true })
  @Field()
  public email: string;

  @Prop({ type: [String], required: true })
  @Field(() => [String])
  public tags: string[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }] })
  @Field(() => [Chat])
  chats: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: [String], required: true })
  @Field(() => [String])
  public group: string[];

  @Prop({ type: [String], required: true })
  @Field(() => [String])
  public followers: string[];

  @Prop({ type: [String], required: true })
  @Field(() => [String])
  public following: string[];

  @Prop({ type: [String], required: true })
  @Field(() => [String])
  public posts: string[];

  @Prop({ type: [String], required: true })
  public token: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
