import { Types } from 'mongoose';
import { Audience } from 'src/post/interfaces/post.audience.enums';
import { Post } from 'src/post/entity/post.schema';

const someObjectId = new Types.ObjectId();

const initial_object = {
  _id: someObjectId,
  usersId: [],
  messages: [],
};

export const other_post_mockup = {
  _id: someObjectId,
  ...initial_object,
};

export const PostStub = (audience: Audience = Audience.PUBLIC): Post =>
  ({ audience, ...initial_object }) as unknown as Post;
