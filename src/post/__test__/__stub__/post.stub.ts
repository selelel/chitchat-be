import { Types } from 'mongoose';
import { Audience } from 'src/post/interfaces/post.audience.enums';
import { Post } from 'src/post/entity/post.schema';
import { PostContentObject } from 'src/post/interfaces/post.content_object';

const someObjectId = new Types.ObjectId();

const initial_object = {
  shared_post_ref: new Types.ObjectId(),
  tags: [],
  comments: [],
  likes: [],
  author: '__id__',
  shares: 0,
  audience: Audience.PUBLIC,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  content: {
    description: '__TEST_DESC__',
    text: '___TEST_TEXT__',
    image: ['__IMG1__'],
  } as PostContentObject,
};

export const other_post_mockup = {
  _id: someObjectId,
  ...initial_object,
};

export const PostStub = (audience: Audience = Audience.PUBLIC): Post =>
  ({ audience, ...initial_object }) as unknown as Post;
