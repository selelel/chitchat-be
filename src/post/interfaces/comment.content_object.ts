import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CommentContentObject {
  @Field(() => [String], { nullable: true })
  image?: string[];

  @Field({ nullable: true })
  text?: string;
}
