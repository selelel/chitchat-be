import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { chatInfoArray, userAccountInfo, userPersonalInfo } from './user.dto';

export type UserDocument = HydratedDocument<User>;

const schemaObject = {
  user: {
    type: {
      firstname: { type: String, required: true },
      lastname: { type: String, required: true },
      username: { type: String, required: true },
      hide_name: { type: Boolean, required: true },
    },
    required: true,
  },
  password: { type: String, required: true },
  email: { type: String, required: true },
  userInfo: {
    avatar: { type: Buffer },
    bio: { type: String },
    age: { type: Number },
    mbti: { type: String },
    gender: { type: String, enum: ['M', 'F'] },
  },
  tags: [{ type: String }],
  chats: [
    {
      chatId: { type: String },
      recipientId: { type: String },
      typing: { type: Boolean },
      isFriend: { type: Boolean },
      status: { type: String, enum: ['valid', 'block', 'permission_needed'] },
      mute: {
        is: { type: Boolean },
        until: { type: Date },
      },
    },
  ],
  group: [{ type: String }],
  followers: [{ type: String }],
  following: [{ type: String }],
  post: [{ type: String }],
};

@Schema()
export class User {
  @Prop(raw(schemaObject.user))
  user: userPersonalInfo;
  @Prop({ type: String, required: true })
  password: string;
  @Prop({ type: String, required: true })
  email: string;
  @Prop(raw(schemaObject.userInfo))
  userInfo: userAccountInfo;
  @Prop({ type: [String] })
  tags: [string];
  @Prop(raw([schemaObject.chats]))
  chat: chatInfoArray[];
  @Prop({ type: [String] })
  group: string;
  @Prop({ type: [String] })
  followers: string;
  @Prop({ type: [String] })
  following: string;
  @Prop({ type: [String] })
  post: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
