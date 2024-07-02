import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class PostContentInput {
  @Field(() => String)
  description?: string;

  @Field(() => [String], { nullable: true })
  image?: string[];

  @Field({ nullable: true })
  text?: string;
}
