import { Field, InputType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-scalars';
import { AccountObjectEntity, PersonalObjectEntity } from '../entities';

@InputType()
export class UserInput {
  @Field(() => GraphQLJSONObject)
  public user: PersonalObjectEntity;

  @Field(() => GraphQLJSONObject)
  public userInfo: AccountObjectEntity;

  @Field(() => String)
  public password: string;

  @Field(() => String)
  public email: string;
}
