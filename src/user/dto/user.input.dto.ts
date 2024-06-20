import { Field, InputType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-scalars';
import { AccountObjectEntity } from './account.object.entity';
import { PersonalObjectEntity } from './personal.object.entity';
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
