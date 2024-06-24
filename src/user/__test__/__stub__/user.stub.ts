import { Types } from 'mongoose';
import { UserDoc } from '../../dto/user-document.interface';
import { User } from 'src/user/entities/user.entity';

const someObjectId = new Types.ObjectId();

const initial_object = {
  _id: someObjectId,
  user: {
    firstname: '__test__',
    lastname: '__test__',
    username: '__test__',
    hide_name: false,
  },
  userInfo: {
    avatar: '__test__',
    bio: '__test__',
    age: 21,
    mbti: 'INFJ',
    gender: 'F',
  },
  tags: [],
  isActive: false,
  isPrivate: false,
  chats: [
    {
      _id: new Types.ObjectId(),
      usersId: [new Types.ObjectId(), new Types.ObjectId()],
      messages: [new Types.ObjectId(), new Types.ObjectId()],
    },
  ],
  followers: [],
  following: [],
  token: [],
  group: [],
  posts: [],
  requests: {
    toFollowers: [],
    toFollowings: [],
  },
};

export const other_user_mockup = {
  _id: someObjectId,
  password: 'somePassword',
  email: 'test_other@example.com',
  ...initial_object,
};

export const UserStub = (): User =>
  ({
    password: 'somePassword',
    email: 'test@example.com',
    ...initial_object,
  }) as unknown as User;

export const user_mockup_arr: Partial<UserDoc>[] = new Array(3).fill(
  initial_object,
);
