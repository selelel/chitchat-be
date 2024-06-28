import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class MessageContentInput {
  @Field(() => String, { nullable: true })
  text?: string;

  @Field(() => [String], { nullable: true })
  images?: string[];
}
