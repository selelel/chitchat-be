import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PersonalObjectEntity {
  @Field(() => String)
  firstname: string;

  @Field(() => String)
  lastname: string;

  @Field(() => String)
  username: string;

  @Field(() => Boolean)
  hide_name: boolean;
}