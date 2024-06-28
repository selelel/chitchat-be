import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Connection } from 'mongoose';
import { User, UserSchema } from '../entities/user.entity';
import { UserService } from '../user.service';
import { getConnectionToken } from '@nestjs/mongoose';
import { UserStub } from './__stub__/user.stub';
import { MongoMemoryServerSingleton } from 'src/utils/__test__/__server__/memory.server';

let __id__: any;
let __id2__: any;

describe('Testing the UserService', () => {
  let service: UserService;
  let model: Model<User>;
  let connection: Connection;

  beforeAll(async () => {
    const uri = await MongoMemoryServerSingleton.getInstance();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
    model = module.get<Model<User>>(getModelToken(User.name));
    connection = module.get<Connection>(getConnectionToken());
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await MongoMemoryServerSingleton.stopInstance();
    await connection.close();
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Should be defined connection', () => {
    expect(connection).toBeDefined();
  });

  it('Should create users', async () => {
    const [someUser, otherUser] = await Promise.all([
      service.createUser({
        email: UserStub().email,
        password: UserStub().password,
        user: UserStub().user,
      }),
      service.createUser({
        email: UserStub().email,
        password: UserStub().password,
        user: UserStub().user,
      }),
    ]);

    expect(someUser).toBeInstanceOf(model);
    expect(someUser.email).toBe(UserStub().email);
    expect(otherUser).toBeInstanceOf(model);
    expect(otherUser.email).toBe(UserStub().email);

    __id__ = someUser._id;
    __id2__ = otherUser._id;
  });

  it('Should return an array of users', async () => {
    const allUser = await service.findAll();
    expect(Array.isArray(allUser)).toBe(true);

    allUser.forEach((user) => {
      expect(user).toBeInstanceOf(model);
    });
  });

  it('Should find user by email', async () => {
    const user = await service.findEmail(UserStub().email);

    expect(user).toBeInstanceOf(Model);
  });

  it('Should find user by id', async () => {
    const user = await service.findOneById(__id__);

    expect(user).toBeInstanceOf(Model);
  });

  it('User create follow request', async () => {
    const [user, targetUser] = await Promise.all([
      await service.requestToFollowUser(__id__, __id2__),
      await service.findOneById(__id2__),
    ]);

    expect(user.requests.toFollowings).toHaveLength(1);
    expect(targetUser.requests.toFollowers).toHaveLength(1);

    const [targetUser_decline_phase, user_decline_phase] = await Promise.all([
      await service.findOneById(__id__),
      await service.removesUserRequest(__id2__, __id__),
    ]);

    expect(user_decline_phase.requests.toFollowings).toHaveLength(0);
    expect(targetUser_decline_phase.requests.toFollowers).toHaveLength(0);
  });

  it('User accept follow request', async () => {
    const [user, targetUser] = await Promise.all([
      await service.requestToFollowUser(__id__, __id2__),
      await service.findOneById(__id2__),
    ]);

    expect(user.requests.toFollowings).toHaveLength(1);
    expect(targetUser.requests.toFollowers).toHaveLength(1);

    const [targetUser_acceptance_phase, user_acceptance_phase] =
      await Promise.all([
        await service.findOneById(__id__),
        await service.acceptsUserRequestToFollow(__id2__, __id__),
      ]);

    expect(user_acceptance_phase.requests.toFollowings).toHaveLength(0);
    expect(targetUser_acceptance_phase.requests.toFollowers).toHaveLength(0);

    const [targetUser_as_following, user_as_followers] = await Promise.all([
      await service.findOneById(__id2__),
      await service.findOneById(__id__),
    ]);

    expect(user_as_followers.following).toHaveLength(1);
    expect(targetUser_as_following.followers).toHaveLength(1);
  });
});
