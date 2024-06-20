import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Gender, MbtiType } from '../enums';

@ObjectType()
export class AccountObjectEntity {
  @Field()
  avatar: string;

  @Field()
  bio: string;

  @Field(() => Int)
  age: number;

  @Field(() => MbtiType)
  mbti: MbtiType;

  @Field(() => Gender)
  gender: Gender;
}
