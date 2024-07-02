import { Connection, Model } from 'mongoose';
import { ChatService } from '../chat.service';
import { Chat, ChatSchema } from '../entities/chat.entity';
import { UserService } from 'src/user/user.service';
import { User, UserSchema } from 'src/user/entities/user.entity';
import { MongoMemoryServerSingleton } from 'src/utils/__test__/__server__/memory.server';
import { TestingModule } from '@nestjs/testing/testing-module';
import { Test } from '@nestjs/testing';
import {
  getConnectionToken,
  getModelToken,
  MongooseModule,
} from '@nestjs/mongoose';
import { Message, MessageSchema } from '../entities/message.entity';
import { UserStub } from 'src/user/__test__/__stub__/user.stub';
import { FileUploadService } from 'src/utils/utils_modules/services/file_upload.service';
import { BucketsService } from 'src/utils/utils_modules/third_party/buckets.service';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let __id__: any;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let __id2__: any;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let __chatId__: any;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let __messageId__: any;

describe('Testing the PostService', () => {
  let service: ChatService;
  let model: Model<Chat>;
  let message_model: Model<Message>;
  let user_service: UserService;
  let user_model: Model<User>;
  let connection: Connection;

  beforeAll(async () => {
    const uri = await MongoMemoryServerSingleton.getInstance();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: Chat.name, schema: ChatSchema },
          { name: Message.name, schema: MessageSchema },
          { name: User.name, schema: UserSchema },
        ]),
      ],
      providers: [ChatService, UserService, FileUploadService, BucketsService],
    }).compile();

    service = module.get<ChatService>(ChatService);
    model = module.get<Model<Chat>>(getModelToken(Chat.name));
    message_model = module.get<Model<Message>>(getModelToken(Message.name));
    user_model = module.get<Model<User>>(getModelToken(User.name));
    user_service = module.get<UserService>(UserService);
    connection = module.get<Connection>(getConnectionToken());
  });

  afterAll(async () => {
    await MongoMemoryServerSingleton.stopInstance();
    await connection.dropDatabase();
    await connection.close();
  });

  it('Should be defined', async () => {
    expect(service).toBeDefined();
    expect(model).toBeDefined();
    expect(message_model).toBeDefined();
    expect(user_model).toBeDefined();
    expect(user_service).toBeDefined();

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

  it('Should create a chat', async () => {
    const chat = await service.createPrivateRoom(__id__, __id2__);
    __chatId__ = chat._id;

    expect(chat).toBeDefined();
  });

  it('Should message user', async () => {
    const message = await service.sendMessage(__chatId__, __id__, __id2__);
    __messageId__ = message._id;

    const doesChatExisted = await service.isMessageExisted(
      __chatId__,
      __messageId__,
    );

    expect(doesChatExisted).toBeTruthy();
  });
});
