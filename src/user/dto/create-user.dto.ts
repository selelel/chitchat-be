import Mongoose, { Schema } from 'mongoose';
import { chatSchema } from 'src/chat/dto/create-chat.dto';

const mbtiTypes = [
  'ISTJ',
  'ISFJ',
  'INFJ',
  'INTJ',
  'ISTP',
  'ISFP',
  'INFP',
  'INTP',
  'ESTP',
  'ESFP',
  'ENFP',
  'ENTP',
  'ESTJ',
  'ESFJ',
  'ENFJ',
  'ENTJ',
];

const userInfoSchema = new Schema(
  {
    avatar: {
      type: Buffer,
      required: false,
    },
    bio: {
      type: String,
      required: false,
    },
    age: {
      type: Number,
      required: false,
    },
    mbti: {
      type: String,
      enum: mbtiTypes,
      required: false,
    },
    gender: {
      type: String,
      enum: ['M', 'F'],
      required: false,
    },
  },
  { _id: false },
);

const userSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  userInfo: {
    type: userInfoSchema,
    required: false,
  },
  tags: {
    type: [String],
    required: true,
  },
  chats: {
    type: [chatSchema],
    required: true,
  },
  group: {
    type: [String],
    required: false,
  },
  followers: {
    type: [String],
    required: false,
  },
  following: {
    type: [String],
    required: false,
  },
  post: {
    type: [String],
    required: false,
  },
});

const User = Mongoose.model('User', userSchema);

module.exports = User;

export class CreateUserDto {}
