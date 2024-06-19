import { TestingModule, Test } from '@nestjs/testing';
import { UserResolver } from '../user.resolver';
import { UserService as MockUserService } from './__mocks__/user.service';
import { UserService } from '../user.service';
import { AuthService } from 'src/auth/auth.service';
import { User } from '../entities';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';

describe('Testing UserResolver', () => {
  let userResolver: UserResolver;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        { provide: UserService, useValue: MockUserService() },
        { provide: getModelToken(User.name), useValue: Model },
        AuthService,
      ],
    }).compile();

    userResolver = module.get<UserResolver>(UserResolver);
  });

  afterAll(async () => {});

  it('This should be defined', () => {
    expect(userResolver).toBeDefined();
  });

  it('Should run the testQuery', () => {
    expect(userResolver.testQuery()).toBeDefined();
  });
});
