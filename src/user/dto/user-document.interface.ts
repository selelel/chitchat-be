import mongoose, { Document } from 'mongoose';
import { AccountObjectEntity } from './account.object.entity';
import { PersonalObjectEntity } from './personal.object.entity';
import { RequestObjectDto } from './request.object.dto';

export class UserDoc extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  user: PersonalObjectEntity;
  userInfo: AccountObjectEntity;
  password: string;
  email: string;
  tags: string[];
  isActive: boolean;
  requests: RequestObjectDto;
  isPrivate: boolean;
  chats: mongoose.Schema.Types.ObjectId[];
  followers: mongoose.Schema.Types.ObjectId[];
  following: mongoose.Schema.Types.ObjectId[];
  token: string[];
  group: string[];
  posts: string[];
}
