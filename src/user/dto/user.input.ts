import { Field, InputType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-scalars';
import { userAccountInfo } from './user.account.info';
import { userPersonalInfo } from './user.personal.info';

@InputType()
export class UserInput {
  @Field(() => GraphQLJSONObject)
  user: userPersonalInfo;

  @Field()
  password: string;

  @Field()
  email: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  userInfo?: userAccountInfo;
}
