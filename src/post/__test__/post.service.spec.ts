import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { PostService } from '../post.service';
import { Post, PostSchema } from '../entity/post.schema';
import { Comments, CommentsSchema } from '../entity/comments.schema';
import { MongoMemoryServerSingleton } from 'src/utils/__test__/__server__/memory.server';
import { User, UserSchema } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { UserStub } from 'src/user/__test__/__stub__/user.stub';
import { PostStub } from './__stub__/post.stub';
import { Audience } from '../interfaces/post.audience.enums';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let __id__: any;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let __id2__: any;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let __postId__: any;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let __commentId__: any;

describe('Testing the PostService', () => {
  let service: PostService;
  let model: Model<Post>;
  let user_service: UserService;
  let user_model: Model<User>;
  let connection: Connection;

  beforeAll(async () => {
    const uri = await MongoMemoryServerSingleton.getInstance();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: Post.name, schema: PostSchema },
          { name: Comments.name, schema: CommentsSchema },
          { name: User.name, schema: UserSchema },
        ]),
      ],
      providers: [PostService, UserService],
    }).compile();

    service = module.get<PostService>(PostService);
    model = module.get<Model<Post>>(getModelToken(Post.name));
    user_model = module.get<Model<User>>(getModelToken(User.name));
    user_service = module.get<UserService>(UserService);
    connection = module.get<Connection>(getConnectionToken());
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await MongoMemoryServerSingleton.stopInstance();
    await connection.close();
  });

  it('Variable/s to be defined', async () => {
    expect(service).toBeDefined();
    expect(model).toBeDefined();
    expect(user_service).toBeDefined();
    expect(user_model).toBeDefined();

    const [someUser, otherUser] = await Promise.all([
      user_service.createUser({
        email: UserStub().email,
        password: UserStub().password,
        user: UserStub().user,
      }),
      user_service.createUser({
        email: UserStub().email,
        password: UserStub().password,
        user: UserStub().user,
      }),
    ]);

    expect(someUser).toBeDefined();
    expect(otherUser).toBeDefined();

    __id__ = someUser._id;
    __id2__ = otherUser._id;
  });

  it('Should create post', async () => {
    const { content } = PostStub();
    const post = await service.createPost(__id__, content, {
      audience: Audience.FRIENDS,
    });
    __postId__ = post._id;

    for (let i = 0; i <= 3; i++) {
      await Promise.all([
        await service.createPost(__id__, {
          ...content,
          description: `user1 ${i}`,
        }),
        await service.createPost(__id2__, {
          ...content,
          description: `user2 ${i}`,
        }),
      ]);
    }

    expect(post).toBeDefined();
  });

  it('Should update post', async () => {
    const mock_text = '__UPDATE_TEST__';
    const { content } = await service.updatePost(__postId__, {
      description: mock_text,
    });

    expect(content.description).toBe(mock_text);
  });

  it('Should comment on post', async () => {
    const mock = '_TEST_COMMENT_';
    const {
      comments: [
        {
          _id,
          content: { text },
        },
      ],
    } = await service.addPostComments(__id2__, __postId__, {
      text: mock,
      image: ['__IMAGE__'],
    });

    expect(text).toBe(mock);
    __commentId__ = _id;
  });

  it('Should edit a comment on post', async () => {
    const mock_text = '_UPDATE_COMMENT_';
    const { content } = await service.editPostComments(__commentId__, {
      text: mock_text,
    });

    expect(content.text).toBe(mock_text);
  });

  it('Should remove a comment on post', async () => {
    const { comments } = await service.removePostComments(
      __postId__,
      __commentId__,
    );

    expect(comments).toHaveLength(0);
  });

  it('Should getUserRecommendation', async () => {
    const recommendations = await service.getRecommendations(__id2__, {
      skip: 0,
      limit: 10,
    });

    expect(recommendations).toBeDefined();
  });

  it('Should getUserFollowingPosts', async () => {
    await user_model.findByIdAndUpdate(
      __id__,
      {
        $push: {
          following: __id2__,
        },
      },
      { new: true },
    );
    const followingPost = await service.getUserFollowingPost(__id__, {
      skip: 0,
      limit: 10,
    });

    expect(followingPost).toBeDefined();
  });
});
