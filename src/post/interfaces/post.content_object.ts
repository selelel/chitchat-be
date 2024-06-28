import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PostContentObject {
  @Field(() => String)
  description?: string;

  @Field(() => [String], { nullable: true })
  image?: string[];

  @Field({ nullable: true })
  text?: string;

  // @Field(() => JSON, { nullable: true })
  // event?: any;
}
