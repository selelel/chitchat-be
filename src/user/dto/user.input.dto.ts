import { Field, InputType } from '@nestjs/graphql';
// import { AccountObjectEntity, PersonalObjectEntity } from '../entities';

@InputType()
export class UserInput {
  // @Field(() => GraphQLObjectType)
  // public user: PersonalObjectEntity;

  // @Field(() => GraphQLObjectType)
  // public userInfo: AccountObjectEntity;

  @Field(() => String)
  public password: string;

  @Field(() => String)
  public email: string;
}
