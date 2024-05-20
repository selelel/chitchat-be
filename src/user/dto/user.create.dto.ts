import { Field, ObjectType } from 'type-graphql';
import { chatInfoArray, userAccountInfo, userPersonalInfo } from './user.dto';

@ObjectType()
export class CreateUserDto {
  @Field(() => Object)
  user: userPersonalInfo;
  @Field(() => String)
  password: string;
  @Field(() => String)
  email: string;
}

@ObjectType()
export class User {
  @Field(() => ({
    firstname: String,
    lastname: String,
    username: String,
    hide_name: Boolean,
  }))
  user: userPersonalInfo;
  @Field(() => String)
  password: string;
  @Field(() => String)
  email: string;
  @Field(() => ({
    avatar: Buffer,
    bio: String,
    age: String,
    mbti: String,
    gender: ['M', 'F'],
  }))
  userInfo: userAccountInfo;
  @Field(() => [])
  tags: [string];
  @Field(() => [])
  chat: chatInfoArray[];
  @Field(() => [])
  group: string[];
  @Field(() => [])
  followers: string[];
  @Field(() => [])
  following: string[];
  @Field(() => [])
  post: string[];
}
