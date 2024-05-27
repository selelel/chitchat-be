import { Field, ObjectType } from '@nestjs/graphql';
import { Chat } from 'src/chat/entities/chat.entity';
import { PersonalObjectEntity } from './personal.object.entity';
import { AccountObjectEntity } from './account.object.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
@ObjectType()
export class User {
  @Prop({ type: mongoose.Schema.Types.ObjectId }) // No need for required: true
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ type: PersonalObjectEntity, required: true })
  @Field(() => PersonalObjectEntity)
  user: PersonalObjectEntity;

  @Prop({ type: AccountObjectEntity, required: true })
  @Field(() => AccountObjectEntity, { nullable: true })
  userInfo: AccountObjectEntity;

  @Prop({ type: String, required: true })
  public password: string;

  @Prop({ type: String, required: true })
  @Field()
  public email: string;

  @Prop({ type: [String], required: true })
  @Field(() => [String])
  public tags: string[];

  @Prop({ type: [String], required: true })
  chats: Chat[];

  @Prop({ type: [String], required: true })
  @Field(() => [String], { nullable: true })
  public group: string[];

  @Prop({ type: [String], required: true })
  @Field(() => [String], { nullable: true })
  public followers: string[];

  @Prop({ type: [String], required: true })
  @Field(() => [String], { nullable: true })
  public following: string[];

  @Prop({ type: [String], required: true })
  @Field(() => [String], { nullable: true })
  public post: string[];

  @Prop({ type: [String], required: true })
  public token: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
