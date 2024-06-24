import { UserStub } from '../__stub__/user.stub';

export const UserService = jest.fn().mockReturnValue({
  findAll: jest.fn().mockResolvedValue([UserStub()]),
  createUser: jest.fn().mockResolvedValue(UserStub()),
  requestToFollowUser: jest.fn().mockResolvedValue(UserStub()),
  removesUserRequest: jest.fn().mockResolvedValue(UserStub()),
  acceptsUserRequestToFollow: jest.fn().mockResolvedValue(UserStub()),
  removeUserFollowing: jest.fn().mockResolvedValue(UserStub()),
  removeUserFollower: jest.fn().mockResolvedValue(UserStub()),
});
