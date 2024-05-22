import { Field, InputType } from '@nestjs/graphql';
import { userAccountInfo, userPersonalInfo } from './user.interfaces';
import { GraphQLJSONObject } from 'graphql-scalars';

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
