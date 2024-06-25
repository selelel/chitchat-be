import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CommentContentInput {
  @Field(() => [String], { nullable: true })
  image?: string[];

  @Field({ nullable: true })
  text?: string;
}
