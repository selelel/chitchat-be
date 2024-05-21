import { Field, InputType } from 'type-graphql';
import { userAccountInfo, userPersonalInfo } from './user.dto';
import { GraphQLJSONObject } from 'graphql-scalars';

@InputType()
export class userInput {
  @Field(() => GraphQLJSONObject)
  user: userPersonalInfo;

  @Field()
  password: string;

  @Field()
  email: string;
  @Field(() => GraphQLJSONObject, { nullable: true })
  userInfo?: userAccountInfo;
}
