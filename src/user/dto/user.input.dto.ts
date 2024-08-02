import { Field, InputType } from '@nestjs/graphql';
import { PersonalObjectEntity } from './personal.object.entity';
import { GraphQLJSONObject } from 'graphql-scalars';
@InputType()
export class UserInput {
  @Field(() => GraphQLJSONObject)
  public user: PersonalObjectEntity;

  @Field(() => String)
  public password: string;

  @Field(() => String)
  public email: string;
}
